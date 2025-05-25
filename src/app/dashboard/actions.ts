"use server"
import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import Razorpay from "razorpay"

const rzpClient = new Razorpay({
  key_id: process.env.RAZORPAY_PAYMENTS_APIKEY,
  key_secret: process.env.RAZORPAY_PAYMENTS_APISECRET,
})

export interface InitiateSubscriptionResponse { 
  success: boolean; 
  message: string; 
  razorpaySubscriptionId?: string; 
}

export async function initiateSubscription(modelId: string): Promise<InitiateSubscriptionResponse> {
  const { userId: clerkId } = await auth()

  if (!clerkId) {
    return {success: false, message: "Unauthorized"}
  }

  const user = await prisma.user.findUnique({
    where: {
      clerkId,
    },
    select: { 
        id: true, 
        clerkId: true,
        email: true, 
        firstName: true,
        lastName: true,
        UserSubscription: { 
            where: { 
                modelId: modelId,
            },
            select: { 
                razorpaySubscriptionId: true,
                modelId: true, 
                status: true, 
            }
        }
    }
  })

  console.log(user)

  if (!user) {
    return {success: false, message: "User not found"}
  }

  if (user.UserSubscription.length > 0 && user.UserSubscription[0].status == "active") { 
    return {success: false, message: "User already has an subscription with this specific model."}
  }

  const model = await prisma.model.findUnique({ 
    where: { 
       id: modelId
    },
    select: { 
        razorpayPlanId: true, 
        price: true, 
    }
  })

  if (!model) { 
    return {success: false, message: "Model not found"}
  }

  if ( user.UserSubscription.length > 0 && user.UserSubscription[0].status == "created") { 
    return {success: true, message: "Subscription already initiated", razorpaySubscriptionId: user.UserSubscription[0].razorpaySubscriptionId}
  }


  const subscription =  rzpClient.subscriptions.create({ 
    plan_id: model.razorpayPlanId, 
    customer_notify: true, 
    quantity: 1,
    total_count: 36, 
    notes: { 
      modelId: modelId, 
      userId: user.id
    }

  })
  const subscriptionResponse =await subscription

  if (subscriptionResponse.id) {
    console.log("razorpay subscription created successfully", subscriptionResponse.id)

    await prisma.userSubscription.create({ 
      data: { 
        userId: user.id, 
        modelId: modelId, 
        amount: model.price, 
        startDate: new Date(), 
        lastPaymentDate: new Date(), 
        status: "created", 
        razorpaySubscriptionId: subscriptionResponse.id, 
        razorpayPlanId: model.razorpayPlanId, 
      }
    })


    console.log("initated payment for user subscription")

    return {success: true, message: "Subscription initiated successfully", razorpaySubscriptionId: subscriptionResponse.id}

  } else { 
    return {success: false, message: "Failed to initiate subscription"}
  }

}

export interface IsUserSubscribedToModelResponse { 
  success: boolean; 
  message: string; 
  isSubscribed: boolean; 
  isSoftSuccess?: boolean; 
}

export async function isUserSubscribedToModel(modelId: string): Promise<IsUserSubscribedToModelResponse> { 
  const { userId: clerkId } = await auth()

  if (!clerkId) {
    return {success: false, message: "Unauthorized", isSubscribed: false}
  }

  const user = await prisma.user.findUnique({ 
    where: { 
      clerkId, 
    }, 
    select: { 
      UserSubscription: { 
        where: { 
          modelId: modelId, 
        }, 
        select: { 
          status: true, 
          isSoftSuccess: true, 
        }
      }
    }
  })

  if (!user) { 
    return {success: false, message: "User not found", isSubscribed: false}
  }

  if (user.UserSubscription.length > 0 && user.UserSubscription[0].status == "active") { 
    return {success: true, message: "User is subscribed to model", isSubscribed: true}
  }

  return {success: true, message: "User is not subscribed to model", isSubscribed: false, isSoftSuccess: user.UserSubscription[0].isSoftSuccess!}
}

export interface Model {
  id: string;
  name: string;
  description: string;
  modelType: string;
  license: string;
  sourceType: 'URL' | 'UPLOAD';
  url: string | null;
  tags: string[];
  parameters: number;
  subscriptionPrice: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
  creator: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

export async function getModels(): Promise<{ success: boolean; message: string; models?: Model[] }> {
  try {
    const models = await prisma.model.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        modelType: true,
        license: true,
        sourceType: true,
        url: true,
        tags: true,
        parameters: true,
        subscriptionPrice: true,
        price: true,
        createdAt: true,
        updatedAt: true,
        creator: {
          select: {
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Convert Decimal values to numbers
    const serializedModels = models.map(model => ({
      ...model,
      price: Number(model.price),
      subscriptionPrice: Number(model.subscriptionPrice),
      parameters: Number(model.parameters)
    }));

    return {
      success: true,
      message: "Models fetched successfully",
      models: serializedModels
    };
  } catch (error) {
    console.error("Error fetching models:", error);
    return {
      success: false,
      message: "Failed to fetch models"
    };
  }
}



export async function updateSoftSuccess(razorpaySubscriptionId: string) { 

  try { 

    if (razorpaySubscriptionId == "NA") { 
      return {success: false, message: "Razorpay subscription id is not provided"}
    }

    const { userId: clerkId } = await auth()

    if (!clerkId) { 
      return {success: false, message: "Unauthorized"}
    }

    const user = await prisma.user.findUnique({ 
      where: { 
        clerkId,
      },
      select: { 
        UserSubscription: { 
          where: { 
            razorpaySubscriptionId: razorpaySubscriptionId,
          },
          select: { 
            id: true,
          }
        }
      }
    })

    if (!user) { 
      return {success: false, message: "User not found"}
    }

    if (user.UserSubscription.length == 0) { 
      return {success: false, message: "User subscription not found"}
    }

    await prisma.userSubscription.update({ 
      where: { 
        razorpaySubscriptionId: razorpaySubscriptionId,
      },
      data: { 
        isSoftSuccess: true,
      }
    })

    console.log("Soft success updated for user subscription", user.UserSubscription[0].id)

    return {success: true, message: "Soft success updated"}

  } catch (error) { 
    console.error("Error updating soft success", error)
    return {success: false, message: "Error updating soft success"}
  }
  
}