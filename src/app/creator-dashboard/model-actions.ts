"use server"

import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { SourceType, DeploymentStatus } from '@prisma/client';
import { randomBytes as nodeRandomBytes } from 'crypto';

const ELEVATED_ROLE = 'ELEVATED_USER' as const;  // expected creator role

// ---------------------------------------------------------------------------
// helper: returns the Creator record only if:
//   • user exists in the DB,
//   • user has a linked creator profile, and
//   • user.role === ELEVATED_USER
async function getLoggedInCreator() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { role: true, creator: true },
  });

  if (!user) return null;                // user not in DB
  if (user.role !== ELEVATED_ROLE) return null; // wrong role
  if (!user.creator) return null;        // not a creator

  return user.creator;
}
// ---------------------------------------------------------------------------

export async function uploadModelAction(formData: FormData) {
  try {
    // ----- use shared helper ------------------------------------------------
    const creator = await getLoggedInCreator();
    if (!creator) {
      return { success: false, error: 'Creator profile not found', status: 403 };
    }
    // -----------------------------------------------------------------------

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const modelType = formData.get('modelType') as string;
    const license = formData.get('license') as string;
    const sourceType = formData.get('sourceType') as string;
    const url = formData.get('url') as string;
    const tags = (formData.get('tags') as string).split(',').filter(tag => tag.trim());
    const parameters = parseFloat(formData.get('parameters') as string);
    const revision = formData.get('revision') as string;
    const file = formData.get('file') as File | null;
    const subscriptionPrice = parseFloat(formData.get('subscriptionPrice') as string);
    const hfOrganizationName = formData.get('hfOrganizationName') as string;
    const hfModelName = formData.get('hfModelName') as string;

    // Optional validation for tags (specific to creator-dashboard)
    if (tags.length === 0) {
      return { success: false, error: 'At least one tag is required.' };
    }
    
    // Validate source type
    const normalizedSourceType = sourceType.toUpperCase() as SourceType;
    if (!Object.values(SourceType).includes(normalizedSourceType)) {
      return { success: false, error: 'Invalid source type' };
    }

    // For URL source type, validate Hugging Face model existence
    if (normalizedSourceType === SourceType.URL) {
      if (!url) {
        return { success: false, error: 'URL is required for URL source type.' };
      }

      // Check if model exists on Hugging Face -------------------------------
      try {
        const checkPayload = {
          model_name: hfModelName,
          org_name: hfOrganizationName,
          model_revision: revision || "main",
        };

        const registryUrl =
          process.env.DEPLOYMENT_API_URL || "http://localhost:8000"; // <- env fallback
        const checkRes = await fetch(
          `${registryUrl}/check_if_model_exists`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(checkPayload),
          }
        );
        
        const exists = await checkRes.json();
        if (!exists) {
          return { success: false, error: 'Model does not exist on Hugging Face with the given details.' };
        }
      } catch (error) {
        return { success: false, error: 'Failed to verify model existence on Hugging Face.' + error };
      }
    }

    // Validate subscription price
    if (isNaN(subscriptionPrice) || subscriptionPrice < 0) {
      return { success: false, error: 'Invalid subscription price. Must be a non-negative number.' };
    }

    // Check if a model with the same name already exists
    const existing = await prisma.model.findUnique({ where: { name } });
    if (existing) {
      return { success: false, error: 'A model with this name already exists.' };
    }

    // Find the corresponding ModelScript for this model type, but only if it's not "other"
    let modelScript = null;
    if (modelType !== "other") {
      modelScript = await prisma.modelScript.findFirst({
        where: { modelType }
      });
    }

    // Process file upload (if applicable)
    let fileUrl = url;
    if (normalizedSourceType === SourceType.UPLOAD && file) {
      // In a production environment, you would:
      // 1. Upload the file to a storage service
      // 2. Get the URL to the uploaded file
      // For this example, we'll use a placeholder
      fileUrl = 'file-upload-placeholder';
    } else if (normalizedSourceType === SourceType.UPLOAD) {
      // If no file is provided for UPLOAD type, use a placeholder
      fileUrl = 'pending-upload-placeholder';
    }

    // Create model in database with creator relationship
    const model = await prisma.model.create({
      data: {
        name,
        description,
        modelType,
        license,
        sourceType: normalizedSourceType,
        url: fileUrl,
        tags,
        parameters,
        revision,
        subscriptionPrice,
        scriptId: modelScript?.id,
        creatorId: creator.id,                       // <- use creator from helper
      },
    });
    
    return { success: true, model };
  } catch (error) {
    console.error('Error in uploadModelAction:', error);
    return { success: false, error: 'Failed to create model.' };
  }
}

// ---------------------------------------------------------------------------
// Additional helpers
function generateApiKey(modelUniqueName: string) {
  return `${modelUniqueName}-${randomBytes(16).toString('hex')}`;
}
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// 1.  Models CRUD ------------------------------------------------------------
export async function getModels() {
  "use server";
  const creator = await getLoggedInCreator();
  if (!creator) return { success: false, error: 'Creator profile not found' };

  const models = await prisma.model.findMany({
    where: { creatorId: creator.id },
    include: { script: true },
  });
  return { success: true, models };
}

export async function getModelById(modelId: string) {
  "use server";
  const creator = await getLoggedInCreator();
  if (!creator) return { success: false, error: 'Creator profile not found' };

  const model = await prisma.model.findFirst({
    where: { id: modelId, creatorId: creator.id },
    include: { script: true },
  });
  if (!model) return { success: false, error: 'Model not found' };
  return { success: true, model };
}

export async function updateModelWithScript(modelId: string, scriptId: string) {
  "use server";
  const creator = await getLoggedInCreator();
  if (!creator) return { success: false, error: 'Creator profile not found' };

  const model = await prisma.model.update({
    where: { id: modelId, creatorId: creator.id },
    data: { scriptId, modelType: 'user-defined' },
    include: { script: true },
  });
  return { success: true, model };
}

export async function deleteModel(modelId: string) {
  "use server";
  const creator = await getLoggedInCreator();
  if (!creator) return { success: false, error: 'Creator profile not found' };

  // ensure we only block deletion if *this creator* has deployments
  const hasDeployment = await prisma.deployment.findFirst({
    where: {
      modelId,
      model: { creatorId: creator.id },
    },
  });

  if (hasDeployment) {
    return { success: false, error: 'Cannot delete a model that has deployments' };
  }
  await prisma.model.delete({ where: { id: modelId, creatorId: creator.id } });
  return { success: true };
}
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// 2.  Model scripts ----------------------------------------------------------
export async function createModelScript(content: string, modelType: string) {
  "use server";
  if (!content || !modelType) {
    throw new Error('Content and model type are required');
  }
  const script = await prisma.modelScript.create({ data: { content, modelType } });
  return { success: true, script };
}
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// 3.  Deployments ------------------------------------------------------------
export async function deployModel(modelId: string, gpuType: string = 'default') {
  "use server";
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error('Unauthorized');

  const model = await prisma.model.findUnique({
    where: { id: modelId },
    include: { script: true },
  });
  if (!model) throw new Error('Model not found');

  let deployment = await prisma.deployment.findFirst({ where: { modelId } });
  if (deployment) {
    deployment = await prisma.deployment.update({
      where: { id: deployment.id },
      data: { status: DeploymentStatus.NOTDEPLOYED, gpuType, updatedAt: new Date() },
    });
  } else {
    deployment = await prisma.deployment.create({
      data: {
        modelId,
        status: DeploymentStatus.NOTDEPLOYED,
        gpuType,
        apiKey: generateApiKey(model.name),
      },
    });
  }

  const apiUrl = process.env.DEPLOYMENT_API_URL || 'http://localhost:8000';
  const res = await fetch(`${apiUrl}/deploy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      org_name: model.url?.split('/')[3] || 'default',
      model_name: model.url?.split('/')[4] || model.name,
      model_revision: model.revision || 'main',
      model_unique_name: model.name,
      param_count: model.parameters,
      custom_script: model.script?.content || null,
      user_id: clerkId,
      api_key: deployment.apiKey,
    }),
  }).catch(() => null);

  if (!res || !res.ok) {
    await prisma.deployment.update({
      where: { id: deployment.id },
      data: { status: DeploymentStatus.FAILED, updatedAt: new Date() },
    });
    throw new Error('Deployment request failed');
  }

  const body = await res.json().catch(() => ({}));
  deployment = await prisma.deployment.update({
    where: { id: deployment.id },
    data: {
      status: DeploymentStatus.RUNNING,
      deploymentUrl: body.deployment_url || null,
      updatedAt: new Date(),
    },
  });

  return { success: true, deployment, script: model.script?.content || null, response: body };
}
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// 5.  Deployment records CRUD ------------------------------------------------
export async function getDeployments() {
  "use server";
  const creator = await getLoggedInCreator();
  if (!creator) return { success: false, error: 'Creator profile not found' };

  return {
    deployments: await prisma.deployment.findMany({
      where: { model: { creatorId: creator.id } }, // <- scoped to creator
      include: { model: true },
      orderBy: { createdAt: 'desc' },
    }),
  };
}
function randomBytes(size: number): Buffer {
  if (!Number.isInteger(size) || size <= 0) {
    throw new Error('Size must be a positive integer');
  }
  return nodeRandomBytes(size);
}