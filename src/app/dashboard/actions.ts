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

    const userSubscription =await prisma.userSubscription.create({ 
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

  return {success: true, message: "User is not subscribed to model", isSubscribed: false}
}

