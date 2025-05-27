"use server"
import { prisma } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function createCreatorProfile(experienceLevel: string, specialization: string[], aiFrameworks: string[], modelTypes: string[], developmentGoals: string, projectDescription: string, portfolioUrl: string, githubUrl: string) {
    try {
        const { userId: clerkId } = await auth();
        const client = await clerkClient()

        console.log(clerkId)

        if (!clerkId) {
            throw new Error('Unauthorized');
        }

        const user = await prisma.user.findUnique({
            where: { clerkId }, 
            select: {
                id: true,
                clerkId: true,
            }
        })


        if (!user) {
            throw new Error('User not found');
        }

        // Check if creator profile already exists
        const existingCreator = await prisma.creator.findUnique({
            where: { userId: user.id }
        });

        //Create or update creator profile and update user role in a transaction
        await prisma.$transaction([
            existingCreator 
                ? prisma.creator.update({
                    where: { userId: user.id },
                    data: { 
                        experienceLevel: experienceLevel,
                        developmentGoals: developmentGoals,
                        projectDescription: projectDescription,
                        specialization: specialization,
                        aiFrameworks: aiFrameworks,
                        modelTypes: modelTypes,
                        portfolioUrl: portfolioUrl || null,
                        githubUrl: githubUrl || null,
                    }
                })
                : prisma.creator.create({
                    data: { 
                        userId: user.id,
                        experienceLevel: experienceLevel,
                        developmentGoals: developmentGoals,
                        projectDescription: projectDescription,
                        specialization: specialization,
                        aiFrameworks: aiFrameworks,
                        modelTypes: modelTypes,
                        portfolioUrl: portfolioUrl || null,
                        githubUrl: githubUrl || null,
                    }
                }),
            prisma.user.update({
                where: { clerkId },
                data: {
                    role: "ELEVATED_USER"
                }
            })
        ]);

        await client.users.updateUserMetadata(clerkId, {
            publicMetadata: {
                onboardingComplete: true
            }
        })
        
        console.log("Creator profile created successfully and updated session metadata.")
        
        return { 
            success: true, 
            message: existingCreator ? "Creator profile updated successfully" : "Creator profile created successfully", 
            messageTitle: "Success",  
        }

        
    } catch (error) {
        console.error('Error creating/updating creator profile:', error);
        return { 
            success: false, 
            message: "Failed to create/update creator profile",
            messageTitle: "Error",
        }
    }
}