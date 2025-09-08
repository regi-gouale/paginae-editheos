import { PrismaClient } from "@/prisma/generated/prisma";

const prisma = new PrismaClient();

async function resetData() {
  console.log("🧹 Cleaning database...");

  // Supprime tous les membres
  await prisma.member.deleteMany();

  console.log("✅ Database cleaned successfully");
}

resetData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
