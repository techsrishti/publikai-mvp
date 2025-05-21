import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

interface ModelApiCallCreateArgs {
  data: {
    modelId: string;
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
            INSERT INTO "ModelApiCall" ("id", "modelId", "latency", "statusCode", "errorMessage", "timestamp")
            VALUES (gen_random_uuid(), ${args.data.modelId}, ${args.data.latency}, ${args.data.statusCode}, ${args.data.errorMessage}, NOW())
            RETURNING *
          `;
        },
      },
    },
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;