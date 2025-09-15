import { PrismaClient } from "@/prisma/generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";

// Définir les options du client Prisma pour optimiser les performances
const prismaClientSingleton = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  }).$extends(withAccelerate());

  // const optimizeApiKey = process.env.OPTIMIZE_API_KEY;
  // if (optimizeApiKey) {
  //   return client.$extends(withOptimize({ apiKey: optimizeApiKey }));
  // } else {
  //   if (process.env.NODE_ENV === "production") {
  //     throw new Error("OPTIMIZE_API_KEY is required in production for Prisma Optimize extension.");
  //   }
  // Optionally, log a warning in development
  // console.warn("OPTIMIZE_API_KEY is not set. Prisma Optimize extension will not be applied.");
  return client;
};

// Assurer qu'une seule instance de PrismaClient est créée en développement
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof prismaClientSingleton>;
};
export const prisma = globalForPrisma.prisma || prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
