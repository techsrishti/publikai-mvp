import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) { 
  const body = await request.json();
  const event = body.event;

  console.log("Razorpay webhook received", body);

  if (event === "payout.processed") { 
    const payoutId = body.payload.payout.entity.id;
    const payoutStatus = body.payload.payout.entity.status;
    const payoutAmount = body.payload.payout.entity.amount / 100;
    const payoutDate = body.payload.payout.entity.created_at;
    const payoutReferenceNumber = body.payload.payout.entity.reference_id;

    const payout = await prisma.creatorPayout.findUnique({ 
      where: { 
        razorpayPayoutId: payoutId,
      }
    })

    if (!payout) { 
    // TODO: send email to admin
      console.log("Payout not found", payoutId);
      return NextResponse.json({ message: "Payout not found" }, { status: 404 });
    }

    if (payout.status === "processed" || payout.status === "failed") { 
        //TODO: send email to admin. Probably a double webhook. Should use the idempotency key to avoid this. But not needed for mvp.
      console.log("Payout already processed or failed", payoutId);
      return NextResponse.json({ message: "Payout already processed" }, { status: 200 });
    }

    if (payoutStatus === "processed") { 

        //prisma transaction
        await prisma.$transaction(async (tx) => { 
            await tx.creatorPayout.update({ 
                where: { 
                    id: payout.id,
                }, 
                data: { 
                    status: "processed",
                }
            })

            await tx.creator.update({ 
                where: { 
                    id: payout.creatorId,
                }, 
                data: { 
                    outstandingAmount: { 
                        decrement: payoutAmount,
                    },
                    totalPaidAmount: { 
                        increment: payoutAmount,
                    }
                }
            })
        })

        console.log("payout processed", payoutId);
        return NextResponse.json({ message: "Payout processed" }, { status: 200 }); 
    }
  } else if (event === "payout.failed") { 
    const payoutId = body.payload.payout.entity.id;
    const payoutStatus = body.payload.payout.entity.status;
    const payoutAmount = body.payload.payout.entity.amount / 100;
    const payoutDate = body.payload.payout.entity.created_at;
    const payoutReferenceNumber = body.payload.payout.entity.reference_id;

    const payout = await prisma.creatorPayout.findUnique({ 
        where: { 
            razorpayPayoutId: payoutId,
        }
    })

    if (!payout) { 
        //TODO: send email to admin. Probably a double webhook. Should use the idempotency key to avoid this. But not needed for mvp.
        console.log("Payout not found", payoutId);
        return NextResponse.json({ message: "Payout not found" }, { status: 404 });
    }

    if (payout.status === "processed" || payout.status === "failed") { 
        //TODO: send email to admin. Probably a double webhook. Should use the idempotency key to avoid this. But not needed for mvp.
        console.log("Payout already processed or failed", payoutId);
        return NextResponse.json({ message: "Payout already processed or failed" }, { status: 200 });
    }

    if (payoutStatus === "failed") { 
        await prisma.$transaction(async (tx) => { 
            await tx.creatorPayout.update({ 
                where: { 
                    id: payout.id,
                }, 
                data: { 
                    status: "failed",
                }
            })
        })

        console.log("payout failed", payoutId);
        return NextResponse.json({ message: "Payout updated as failed" }, { status: 200 });
    }
  }

  return NextResponse.json({ message: "Webhook received" }, { status: 200 });

}