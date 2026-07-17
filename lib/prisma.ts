import { PrismaClient } from "@/prisma/generated/prisma/client";

// Résout l'URL Accelerate : soit ACCELERATE_URL explicite, soit DATABASE_URL
// si elle est déjà au format Accelerate (prisma:// ou prisma+postgres://).
// Prisma 7 (engine type "client") exige accelerateUrl (ou un adapter).
const resolveAccelerateUrl = () => {
  const explicit = process.env.ACCELERATE_URL;
  if (explicit) return explicit;

  const databaseUrl = process.env.DATABASE_URL;
  if (
    databaseUrl &&
    (databaseUrl.startsWith("prisma://") ||
      databaseUrl.startsWith("prisma+postgres://"))
  ) {
    return databaseUrl;
  }

  return undefined;
};

// Définir les options du client Prisma pour optimiser les performances
const prismaClientSingleton = () => {
  const accelerateUrl = resolveAccelerateUrl();

  // Prisma 7 (engine type "client") exige un accelerateUrl (ou un adapter).
  // On échoue avec un message clair plutôt que l'erreur cryptique du constructeur.
  if (!accelerateUrl) {
    throw new Error(
      "Aucune URL Prisma Accelerate résolue. Définissez ACCELERATE_URL, ou une DATABASE_URL au format prisma:// / prisma+postgres://.",
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