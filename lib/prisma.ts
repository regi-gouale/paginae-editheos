import { PrismaClient } from "@/prisma/generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";
import { withOptimize } from "@prisma/extension-optimize";

// Définir les options du client Prisma pour optimiser les performances
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })
    .$extends(withAccelerate())
    .$extends(withOptimize({ apiKey: process.env.OPTIMIZE_API_KEY || "" }));
};

// Assurer qu'une seule instance de PrismaClient est créée en développement
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof prismaClientSingleton>;
};
export const prisma = globalForPrisma.prisma || prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
