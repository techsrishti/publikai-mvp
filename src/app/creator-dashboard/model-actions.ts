"use server"

import { prisma } from '@/lib/prisma';
import { SourceType } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

interface PrismaError {
  code?: string;
  meta?: {
    target?: string[];
  };
}

export interface LinkBankAccountOrVpa {
  vpa: string; 
  bankAccount: { 
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
    // Extract all possible form fields
    const name = formData.get('name') as string | null;
    const description = formData.get('description') as string | null;
    const modelType = formData.get('modelType') as string | null;
    const license = formData.get('license') as string | null;
    const sourceType = formData.get('sourceType') as string | null;
    const url = formData.get('url') as string | null;
    const file = formData.get('file') as File | null;
    const modelName = formData.get('modelName') as string | null; // Used in creator-dashboard
    const urlModelType = formData.get('urlModelType') as string | null; // Used in creator-dashboard

    // Always ensure tags is an array
    const tagsRaw = formData.get('tags');
    const tags = typeof tagsRaw === 'string'
      ? tagsRaw.split(',').map(tag => tag.trim()).filter(Boolean)
      : [];

    // Debug log for creator-dashboard version
    console.log('Creator Dashboard uploadModelAction received:', {
      name, description, modelType, license, sourceType, url, tags, modelName, urlModelType
    });

    // Validate required fields
    if (!name || !description || !modelType || !license || !sourceType) {
      return { success: false, error: 'All required fields must be provided.' };
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

    // For URL source type, url must be present
    if (normalizedSourceType === SourceType.URL && !url) {
      return { success: false, error: 'URL is required for URL source type.' };
    }

    // File validation removed - files are now optional
    
    // Check if a model with the same name already exists
    const existing = await prisma.model.findUnique({ where: { name } });
    if (existing) {
      return { success: false, error: 'A model with this name already exists.' };
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

    // Create model in database - creator dashboard specific version
    const model = await prisma.model.create({
      data: {
        name,
        description,
        modelType,
        license,
        sourceType: normalizedSourceType,
        url: fileUrl,
        tags,
      },
    });
    
    return { success: true, model };
  } catch (error: unknown) {
    const prismaError = error as PrismaError;
    if (prismaError.code === 'P2002' && prismaError.meta?.target?.includes('name')) {
      return { success: false, error: 'Model name must be unique.' };
    }
    console.error('Error creating model in creator dashboard:', error);
    return { success: false, error: 'Failed to create model' };
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
                name: bankAccount.name,
                ifsc: bankAccount.bankIfscCode,
                account_number: bankAccount.bankAccountNumber
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
    }
    vpa?: { 
      address: string;
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

