"use server"

import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { SourceType, DeploymentStatus } from '@prisma/client';

export async function uploadModelAction(formData: FormData) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return { success: false, error: 'Unauthorized' };
    }

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
    
    // Get the user and creator information
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: { creator: true }
    });

    if (!user || !user.creator) {
      return { success: false, error: 'Creator profile not found', status: 403 };
    }

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

      // Check if model exists on Hugging Face
      try {
        const checkPayload = {
          model_name: hfModelName,
          org_name: hfOrganizationName,
          model_revision: revision || "main",
        };
        
        const checkRes = await fetch("http://127.0.0.1:8000/check_if_model_exists", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(checkPayload),
        });
        
        const exists = await checkRes.json();
        if (!exists) {
          return { success: false, error: 'Model does not exist on Hugging Face with the given details.' };
        }
      } catch (error) {
        return { success: false, error: 'Failed to verify model existence on Hugging Face.' };
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
        creatorId: user.creator.id
      } as any, // Using type assertion as a temporary fix
    });
    
    return { success: true, model };
  } catch (error) {
    console.error('Error in uploadModelAction:', error);
    return { success: false, error: 'Failed to create model.' };
  }
}

export async function getAllModels() { 
  try { 
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return { success: false, error: 'Unauthorized' };
    }

    const models = await prisma.model.findMany({
      select: {
        id: true,
        name: true,
        modelType: true,
      },
    });

    return { success: true, models };
  } catch (error) { 
    console.error('Error fetching models:', error);
    return { success: false, error: 'Failed to fetch models' };
  }
}

export async function startDeployment(modelName: string) { 
  try { 
    const { userId: clerkId } = await auth();
    console.log(clerkId + "requested models")

    if (!clerkId) { 
      return { success: false, error: 'Unauthorized' };
    }

    const model = await prisma.model.findUnique({
      where: { 
        name: modelName,
      },
      include: {
        script: true, // Include the related ModelScript
      },
    });

    if (!model) { 
      return { success: false, error: 'Model not found' };
    }

    const deployment = await prisma.deployment.findFirst({
      where: {
        modelId: model.id,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!deployment) { 
      return { success: false, error: 'Deployment not found' };
    }

    if (deployment.status !== DeploymentStatus.NOTDEPLOYED) { 
      return { success: false, error: 'Deployment already in progress' };
    }

    //send request to deploy model. 
    const deploymentApiIP = process.env.DEPLOYMENT_API_IP;
    const deploymentApiPort = process.env.DEPLOYMENT_API_PORT;

    const response = await fetch(`http://${deploymentApiIP}:${deploymentApiPort}/launch-model`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
          model_type: "AutoModelForCausalLM",
          model_name: model.name,
          user_id: clerkId,
          model_internal_name: model.name,
          script_content: model.script?.content || null,
          custom_script: model.script?.content || null,
        }),
    });

    console.log(response)
    if (response.status == 200) { 
      //Update deployment status to DEPLOYING
      await prisma.deployment.update({
        where: { id: deployment.id },
        data: { status: DeploymentStatus.DEPLOYING },
      });
      return { success: true, message: 'Deployment initiated' };
    }
    else { 
      return { success: false, error: 'Failed to deploy model' };
    }
  }
  catch (error) { 
    console.error('Error deploying model:', error);
    return { success: false, error: 'Failed to deploy model' };
  }
}

export async function getActiveDeployments() {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return { success: false, error: 'Unauthorized' };
    }

    const deployments = await prisma.deployment.findMany({
      where: {
        OR: [
          { status: DeploymentStatus.DEPLOYING },
          { status: DeploymentStatus.RUNNING },
          { status: DeploymentStatus.FAILED }
        ]
      },
      select: {
        id: true,
        modelId: true,
        status: true,
        deploymentUrl: true,
        apiKey: true,
        gpuType: true,
        createdAt: true,
        updatedAt: true,
        model: {
          select: {
            name: true,
            modelType: true,
          }
        }
      }
    });

    return { success: true, deployments };
  } catch (error) {
    console.error('Error fetching active deployments:', error);
    return { success: false, error: 'Failed to fetch active deployments' };
  }
}
