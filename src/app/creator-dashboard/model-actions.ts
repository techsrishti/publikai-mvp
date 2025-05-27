"use server"

import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { SourceType, DeploymentStatus } from '@prisma/client';
import { randomBytes as nodeRandomBytes } from 'crypto';
import Razorpay  from 'razorpay';



const rzpClient = new Razorpay({
  key_id: process.env.RAZORPAY_PAYMENTS_APIKEY,
  key_secret: process.env.RAZORPAY_PAYMENTS_APISECRET,
});


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

export interface LinkBankAccountOrVpa {
  vpa?: string; 
  bankAccount?: { 
    name: string; 
    bankAccountNumber: string; 
    bankIfscCode: string; 
    bankName?: string; 
  }
}

export interface LinkBankAccountOrVpaResponse {
  success: boolean;
  message?: string;
  error?: string;
}

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
    const rzpPlan = await rzpClient.plans.create({ 
      period: "monthly", 
      interval: 1, 
      item: { 
        name: name + " Subscription" + " Monthly",
        amount: subscriptionPrice * 100,
        currency: "INR",
        description: "Subscription for " + name,
      },
      notes: { 
        "model_name": name,
        "model_type": modelType,
        "creator_id": creator.id,
      }
    })

    if (!rzpPlan.id) { 
      console.log("Error creating Razorpay plan", rzpPlan);
      //TODO: In prod email the admin
      return { success: false, error: "Failed to create Razorpay plan" };
    }

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
        razorpayPlanId: rzpPlan.id,
        price: subscriptionPrice,
        creatorId: creator.id,
      },
    });
    
    // Convert Decimal price to number
    return { 
      success: true, 
      model: {
        ...model,
        price: Number(model.price)
      }
    };
  } catch (error) {
    console.error('Error in uploadModelAction:', error);
    return { success: false, error: 'Failed to create model.' };
  }
}


export async function linkBankAccountOrVpa(data: LinkBankAccountOrVpa): Promise<LinkBankAccountOrVpaResponse> {
  try {

    const { userId: clerkId } = await auth();

    if (!clerkId) {
      throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        role: true,
        creator: {
          select: {
            id: true,
            razorpayCreatorId: true,
            razorpayFaId: true,
          }
        }
      }
    })

    if (!user || user.role !== "ELEVATED_USER" || !user.creator) {
      throw new Error("Unauthorized");
    }

    const { vpa, bankAccount } = data;

    if (!vpa && !bankAccount) {
      throw new Error("Invalid request");
    }

    const response = await fetch("https://api.razorpay.com/v1/fund_accounts", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${btoa(`${process.env.RAZORPAY_APIKEY}:${process.env.RAZORPAY_APISECRET}`)}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contact_id: user.creator.razorpayCreatorId,
        account_type: vpa ? "vpa" : "bank_account",
        ...(vpa
          ? { vpa: { address: vpa } }
          : {
              bank_account: {
                name: bankAccount!.name,
                ifsc: bankAccount!.bankIfscCode,
                account_number: bankAccount!.bankAccountNumber
              }
            })
      })
    });


    const responseData = await response.json(); 
    console.log(responseData);

    if (responseData.error) {
      throw new Error(responseData.error.message);
    }

    await prisma.creator.update({ 
      where: { 
        id: user.creator.id
      },
      data: { 
        razorpayFaId: responseData.id,
        razorpayFaType: vpa ? "vpa" : "bank_account"
      }
    })


    return { success: true, message: "Bank account linked successfully" };
    
  } catch (error) {
    console.log("Error linking bank account or VPA:", error);
    return { success: false, error: "Failed to link bank account or VPA" };
  }
}


export interface GetLinkedBankAccountOrVpaResponse {
  success: boolean;
  data: { 
    account_type: string;
    bank_account?: { 
      ifsc: string;
      name: string; 
      account_number: string; 
      bank_name: string;
    },
    vpa?: { 
      address?: string;
    }
  } | null;
  message: string;
}

export async function getLinkedBankAccountOrVpa(): Promise<GetLinkedBankAccountOrVpaResponse> {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        role: true,
        creator: {
          select: {
            razorpayFaId: true,
            razorpayFaType: true,
          }
        }
      }
    })

    if (!user || user.role !== "ELEVATED_USER" || !user.creator) {
      throw new Error("Unauthorized");
    }

    if (!user.creator.razorpayFaId) { 
      console.log("No bank account or VPA linked");
      return { success: true, data: null, message: "Bank account or VPA not linked" };
    }

    const response = await fetch(`https://api.razorpay.com/v1/fund_accounts/${user.creator.razorpayFaId}`, {
        headers: {
          "Authorization": `Basic ${btoa(`${process.env.RAZORPAY_APIKEY}:${process.env.RAZORPAY_APISECRET}`)}`
        }

    })

    const responseData = await response.json();
    console.log(responseData);

    if (responseData.error) {
        throw new Error(responseData.error.message);
    }

    return { success: true, data: responseData, message: "Bank account or VPA linked" };  
    
  } catch (error) {
    console.log("Error getting linked bank account or VPA:", error);
    return { success: false, data: null, message: "Failed to get linked bank account or VPA" };
  }
}

export interface AllPayoutsResponse { 
  success: boolean;
  data: { 
    paidAmount: number;
    payoutDate: Date;
    status: string;
    razorpayPayoutId: string;
    referenceNumber: string;
  }[] | null;
  message: string;
}

export async function getAllPayouts(): Promise<AllPayoutsResponse> { 
  try { 
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: { clerkId }, 
      select: {
        role: true,
        creator: {
          select: {
            id: true,
          }, 
        }, 
      }
    })
    
    if (!user || !user?.creator || user?.role !== "ELEVATED_USER") {
      throw new Error("Unauthorized");
    }

    const payout = await prisma.creatorPayout.findMany({ 
      where: { 
        creatorId: user.creator.id,
      }, 
      orderBy: { 
        payoutDate: "desc"
      }, 
      select: { 
        paidAmount: true, 
        payoutDate: true, 
        status: true, 
        razorpayPayoutId: true, 
        referenceNumber: true, 
      }
    })

    const payoutData = payout.map((payout) => { 
      return { 
        paidAmount: payout.paidAmount.toNumber(), 
        payoutDate: payout.payoutDate, 
        status: payout.status, 
        razorpayPayoutId: payout.razorpayPayoutId, 
        referenceNumber: payout.referenceNumber, 
      }
    })

    return { success: true, data: payoutData, message: "All payouts fetched successfully" };

  } catch (error) {
    console.log("Error getting all payouts:", error);
    return { success: false, data: null, message: "Failed to get all payouts" };
  }
}

export interface CreatorPayoutStatsResponse { 
  success: boolean;
  totalEarned: number | null;
  outstandingAmount: number | null;
  totalPaidAmount: number | null;
  message: string;
}

export async function getCreatorPayoutStats(): Promise<CreatorPayoutStatsResponse> { 
  
  try { 
    const { userId: clerkId } = await auth();

    if (!clerkId) { 
      throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({ 
      where: { clerkId }, 
      select: { 
        role: true, 
        creator: { 
          select: { 
            id: true, 
            outstandingAmount: true, 
            totalPaidAmount: true, 
            totalEarnedAmount: true, 
          }
        }
      }
    })

    if (!user || !user?.creator || user?.role !== "ELEVATED_USER") { 
      throw new Error("Unauthorized");
    }

    return { success: true, totalEarned: user.creator.totalEarnedAmount?.toNumber() ?? null, outstandingAmount: user.creator.outstandingAmount?.toNumber() ?? null, totalPaidAmount: user.creator.totalPaidAmount?.toNumber() ?? null, message: "Creator payout stats fetched successfully" };

  } catch (error) { 
    console.log("Error getting creator payout stats:", error);
    return { success: false, totalEarned: null, outstandingAmount: null, totalPaidAmount: null, message: "Failed to get creator payout stats" };
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

  // Convert Decimal price to number
  const serializedModels = models.map(model => ({
    ...model,
    price: Number(model.price)
  }));

  return { success: true, models: serializedModels };
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

  // Convert Decimal price to number
  const serializedModel = {
    ...model,
    price: Number(model.price)
  };

  return { success: true, model: serializedModel };
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

  // Convert Decimal price to number
  const serializedModel = {
    ...model,
    price: Number(model.price)
  };

  return { success: true, model: serializedModel };
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
      gpuType: body.gpu_type || null,
      updatedAt: new Date(),
    },
  });

  return { success: true, deployment, script: model.script?.content || null, response: body };
}
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// 4.  Metrics ---------------------------------------------------------------
export async function getMetrics() {
  "use server";
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, error: "Unauthorized" };

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { role: true, creator: true },
  });
  if (!user?.creator || user.role !== ELEVATED_ROLE)
    return { success: false, error: "Creator profile not found" };

  const creatorId = user.creator.id;

  const models = await prisma.model.findMany({
    where: { creatorId },
    include: { Deployment: true, apiCalls: true },
  });

  const totalModels   = models.length;
  const activeModels  = models.filter(m => m.Deployment.some(d => d.status.toLowerCase() === "running")).length;
  const pendingModels = totalModels - activeModels;

  const modelEarnings = models.map(m => ({
    name: m.name,
    earnings: "₹0",           // ← plug real earnings when ready
    percentage: 0,
    trend: "0%",
  }));

  const modelPerformance = models.map(m => {
    const calls   = m.apiCalls;
    const ok      = calls.filter(c => c.statusCode >= 200 && c.statusCode < 300);
    const failed  = calls.filter(c => c.statusCode >= 400);
    const avgLat  = ok.length ? Math.round(ok.reduce((a, b) => a + b.latency, 0) / ok.length) : 0;
    return {
      name            : m.name,
      type            : m.modelType ?? "unknown",
      requests        : `${ok.length} successful, ${failed.length} failed`,
      status          : m.Deployment[0]?.status || "Pending",
      performance     : calls.length ? Math.round((ok.length / calls.length) * 100) : 0,
      avgLatency      : `${avgLat}ms`,
      totalCalls      : calls.length,
      successfulCalls : ok.length,
      failedCalls     : failed.length,
    };
  });

  return {
    success         : true,
    totalModels,
    activeModels,
    pendingModels,
    modelEarnings,
    modelPerformance,
  };
}
// ---------------------------------------------------------------------------
// 5.  Deployment records CRUD ------------------------------------------------
export async function getDeployments() {
  "use server";
  const creator = await getLoggedInCreator();
  if (!creator) return { success: false, error: 'Creator profile not found' };

  const deployments = await prisma.deployment.findMany({
    where: { model: { creatorId: creator.id } }, // <- scoped to creator
    include: { 
      model: {
        include: { script: true }
      }
    },
    orderBy: { createdAt: 'desc' },
  });

  // Convert Decimal price to number in the model data
  const serializedDeployments = deployments.map(deployment => ({
    ...deployment,
    model: {
      ...deployment.model,
      price: Number(deployment.model.price)
    }
  }));

  return { deployments: serializedDeployments };
}
function randomBytes(size: number): Buffer {
  if (!Number.isInteger(size) || size <= 0) {
    throw new Error('Size must be a positive integer');
  }
  return nodeRandomBytes(size);
}


export async function getEarningsForAllCreatorModels() {
  try { 
      const { userId: clerkId } = await auth();

      if (!clerkId) { 
          throw new Error('Unauthorized');
      }
      
      const creator = await prisma.creator.findUnique({ 
          where: { userId: clerkId },
          select: { 
              id: true,
          }
      })
      
      if (!creator) { 
          throw new Error('Creator not found');
      }
      
      const models = await prisma.model.findMany({
          where: {
            creatorId: creator.id,
          },
          select: {
            id: true,
            name: true,
            UserSubscription: {
              select: {
                amount: true,
              },
            },
          },
        });
        
        const earningsPerModel = models.map(model => {
          const totalEarnings = model.UserSubscription.reduce(
            (sum, sub) => sum + Number(sub.amount),
            0
          );
        
          return {
            modelId: model.id,
            modelName: model.name,
            totalEarnings,
          };
        });

        return earningsPerModel;
  } catch (error) { 
      console.error('Error getting earnings for all creator models:', error);
      return { 
          success: false, 
          message: "Failed to get earnings for all creator models",
          messageTitle: "Error",
      }
  }
} 


export async function getTotalSubscribedUsers() { 
  try { 
    const { userId: clerkId } = await auth();
    if (!clerkId) { 
      throw new Error('Unauthorized');
    }

    const user = await prisma.user.findUnique({ 
      where: { clerkId },
    })

    if (!user) { 
      throw new Error('User not found');
    }

    const creator = await prisma.creator.findUnique({ 
      where: { userId: user.id },
    })

    if (!creator) { 
      throw new Error('Creator not found');
    }

    const subscriptions = await prisma.userSubscription.groupBy({
      by: ['userId'],
      where: {
        model: {
          creatorId: creator.id,
        },
      },
    });
    
    const totalSubscribedUsers = subscriptions.length;
    
    return { 
      success: true,
      totalSubscribedUsers,
    }
  } catch (error) { 
    console.error('Error getting total subscribed users:', error);
    return { 
      success: false,
      error: 'Failed to get total subscribed users',
      totalSubscribedUsers: 0,
    }
  }
}