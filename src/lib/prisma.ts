import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

interface ModelApiCallCreateArgs {
  data: {
    deploymentId: string;
    latency: number;
    statusCode: number;
    errorMessage?: string | null;
  };
}

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  }).$extends({
    model: {
      modelApiCall: {
        create: async (args: ModelApiCallCreateArgs) => {
          return prisma.$queryRaw`
            INSERT INTO "ModelApiCall" ("id", "deploymentId", "latency", "statusCode", "errorMessage", "timestamp")
            VALUES (gen_random_uuid(), ${args.data.deploymentId}, ${args.data.latency}, ${args.data.statusCode}, ${args.data.errorMessage}, NOW())
            RETURNING *
          `;
        },
      },
    },
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;