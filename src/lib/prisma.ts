import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  }).$extends({
    model: {
      modelApiCall: {
        create: async (args: any) => {
          return prisma.$queryRaw`
            INSERT INTO "ModelApiCall" ("id", "deploymentId", "latency", "statusCode", "errorMessage", "timestamp")
            VALUES (gen_random_uuid(), ${args.data.deploymentId}, ${args.data.latency}, ${args.data.statusCode}, ${args.data.errorMessage}, NOW())
            RETURNING *
          `;
        },
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;