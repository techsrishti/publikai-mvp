import {prisma} from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) { 
  const body  = await request.json()
  const event = body.event;


  if (event === "subscription.charged") { 
    const subscription = body.payload.subscription;
    const payment = body.payload.payment;

    console.log('started processing subscription.captured', subscription.entity.id)

    const userSubscriptionId = subscription.entity.id as string
    const userSubscription = await prisma.userSubscription.findUnique({ 
      where: { 
        razorpaySubscriptionId: userSubscriptionId, 
      },
      select: { 
        id: true,
        status: true, 
        razorpayPlanId: true, 
        modelId: true,
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

    const model = await prisma.model.findUnique({ 
      where: { 
        id: userSubscription.modelId,
      },
      select: { 
        price: true,
        creatorId: true,
      }
    })

    if (!model) { 
      //TODO: send email to admin.
      console.log('no model found', userSubscription.modelId)
      return new Response('No model found', { status: 200 })
    }



      //records will be created by the webhook only
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
          razorpayPaymentsId: payment.entity.id,
          subscriptionId: userSubscription.id,
          paymentDate: new Date(),
          status: 'charged',
          remainingCount: subscription.entity.remaining_count,
        }
      })
      console.log('awaiting creator update');
      //add 70% of the amount to the creator's balance
      await prisma.creator.update({ 
        where: { 
          id: model.creatorId,
        },
        data: { 
          outstandingAmount: { increment: Number(model.price) * 0.7 },
          totalEarnedAmount: { increment: Number(model.price) * 0.7 },
        }
      })

      return new Response('Webhook received for recurring payment', { status: 200 })

  } else if (event === "subscription.halted") { 
    const subscription = body.payload.subscription

    console.log('started processing subscription.cancelled', subscription.id)

    const userSubscriptionId = subscription.id as string

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
  } else if (event === "subscription.cancelled") { 
    const subscription = body.payload.subscription

    console.log('started processing subscription.cancelled', subscription.entity.id)

    const userSubscriptionId = subscription.entity.id as string
    
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
  } else if (event === "subscription.paused") { 
    const subscription = body.payload.subscription

    console.log('started processing subscription.pause', subscription.id)

    const userSubscriptionId = subscription.id as string
    
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
  } else if (event === "subscription.resumed") { 
    const subscription = body.payload.subscription

    console.log('started processing subscription.resume', subscription.id)

    const userSubscriptionId = subscription.id as string
    
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
    console.log('received webhook for unknown event', body)
    return new Response('Unknown event', { status: 200 })
  }
}