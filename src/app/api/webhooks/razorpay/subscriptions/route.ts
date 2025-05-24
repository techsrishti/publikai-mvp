import {prisma} from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) { 
  const razorpay  = await request.json()

  console.log("Razorpay webhook received", razorpay);

  if (razorpay.event === "subscription.captured") { 
    const subscription = razorpay

    console.log('started processing subscription.captured', razorpay.payload.subscription.entity.id)

    const userSubscriptionId = razorpay.payload.subscription.entity.id as string
    const userSubscription = await prisma.userSubscription.findUnique({ 
      where: { 
        razorpaySubscriptionId: userSubscriptionId, 
      },
      select: { 
        id: true,
        status: true, 
        razorpayPlanId: true, 
        UserSubscriptionPayments: {
          select: {
            id: true,
            status: true,
            remainingCount: true,
          },
          orderBy: { 
            paymentDate: 'desc',
          }
        } 
      }
    })

    if (!userSubscription) {
      // TODO: send email to admin.
      console.log('no user subscription found', userSubscriptionId)
      return new Response('No user subscription found', { status: 200 })
    }

      //this is from the subsequest payment. records will be created by the webhook only
      console.log(" payment")
      await prisma.userSubscription.update({ 
        where: { 
          id: userSubscription.id,
        },
        data: { 
          status: 'active',
          lastPaymentDate: new Date(),
        }
      })

      await prisma.userSubscriptionPayment.create({ 
        data: { 
          razorpayPaymentsId: razorpay.payload.payment.entity.id,
          subscriptionId: userSubscription.id,
          paymentDate: new Date(),
          status: 'charged',
          remainingCount: subscription.payload.subscription.remaining_count,
        }
      })

      return new Response('Webhook received for recurring payment', { status: 200 })

  } else if (razorpay.event === "subscription.halted") { 
    const subscription = razorpay.payload.subscription

    console.log('started processing subscription.cancelled', subscription.payload.subscription.id)

    const userSubscriptionId = subscription.payload.subscription.id as string

    const userSubscription = await prisma.userSubscription.findUnique({ 
      where: { 
        razorpaySubscriptionId: userSubscriptionId,
      },
    })

    if (!userSubscription) {
      //TODO: send email to admin.
      console.log('no user subscription found', userSubscriptionId)
      return new Response('No user subscription found', { status: 200 })
    }

    await prisma.userSubscription.update({ 
      where: { 
        id: userSubscription.id,
      },
      data: { 
        status: 'halted',
      }
    })

    return new Response('Subscription cancelled', { status: 200 })
  } else if (razorpay.event === "subscription.cancelled") { 
    const subscription = razorpay.payload.subscription

    console.log('started processing subscription.cancelled', subscription.payload.subscription.id)

    const userSubscriptionId = subscription.payload.subscription.id as string
    
    const userSubscription = await prisma.userSubscription.findUnique({ 
      where: { 
        razorpaySubscriptionId: userSubscriptionId,
      },
    })
    
    if (!userSubscription) { 
      //TODO: send email to admin.
      console.log('no user subscription found', userSubscriptionId)
      return new Response('No user subscription found', { status: 200 })
    }

    await prisma.userSubscription.update({ 
      where: { 
        id: userSubscription.id,
      },
      data: { 
        status: 'cancelled',
      }
    })

    return new Response('Subscription cancelled', { status: 200 })
  } else if (razorpay.event === "subscription.paused") { 
    const subscription = razorpay.payload.subscription

    console.log('started processing subscription.pause', subscription.payload.subscription.id)

    const userSubscriptionId = subscription.payload.subscription.id as string
    
    const userSubscription = await prisma.userSubscription.findUnique({ 
      where: { 
        razorpaySubscriptionId: userSubscriptionId,
      },
    })
    
    if (!userSubscription) { 
      //TODO: send email to admin.
      console.log('no user subscription found', userSubscriptionId)
      return new Response('No user subscription found', { status: 200 })
    }
    
    await prisma.userSubscription.update({ 
      where: { 
        id: userSubscription.id,
      },
      data: { 
        status: 'paused',
      }
    })

    return new Response('Subscription paused', { status: 200 })
  } else if (razorpay.event === "subscription.resumed") { 
    const subscription = razorpay.payload.subscription

    console.log('started processing subscription.resume', subscription.payload.subscription.id)

    const userSubscriptionId = subscription.payload.subscription.id as string
    
    const userSubscription = await prisma.userSubscription.findUnique({ 
      where: { 
        razorpaySubscriptionId: userSubscriptionId, 
      },
      select: { 
        status: true, 
        id: true, 
      }
    })
    
    if (!userSubscription) { 
      //TODO: send email to admin.
      console.log('no user subscription found', userSubscriptionId)
      return new Response('No user subscription found', { status: 200 })
    }
    
    if (userSubscription.status !== 'paused') { 
      //TODO: send email to admin.
      console.log('subscription is not paused', userSubscriptionId)
      return new Response('Subscription is not paused', { status: 200 })
    }
    
    await prisma.userSubscription.update({ 
      where: { 
        id: userSubscription.id,
      },
      data: { 
        status: 'active',
      }
    })

    return new Response('Subscription resumed', { status: 200 })
  } else {
    console.log('received webhook for unknown event', razorpay)
    return new Response('Unknown event', { status: 200 })
  }
}