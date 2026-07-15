import { PrismaClient } from "@/prisma/generated/prisma/client";

// Prisma 7 (moteur "client") exige une URL Accelerate ou un driver adapter.
// On résout l'URL Accelerate depuis ACCELERATE_URL, ou depuis DATABASE_URL
// lorsqu'il est déjà au format Accelerate (prisma:// ou prisma+postgres://).
const accelerateUrl =
  process.env.ACCELERATE_URL ??
  (process.env.DATABASE_URL?.startsWith("prisma://") ||
  process.env.DATABASE_URL?.startsWith("prisma+postgres://")
    ? process.env.DATABASE_URL
    : undefined);

// Définir les options du client Prisma pour optimiser les performances
const prismaClientSingleton = () => {
  if (!accelerateUrl) {
    throw new Error(
      "Configuration Prisma manquante : définissez ACCELERATE_URL ou un DATABASE_URL au format Prisma Accelerate (prisma+postgres://…).",
    );
  }

  const client = new PrismaClient({
    accelerateUrl,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
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
