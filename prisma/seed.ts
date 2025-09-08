import { PrismaClient } from "@/prisma/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Supprime les membres existants
  await prisma.member.deleteMany();

  // Crée des membres de test
  const members = await prisma.member.createMany({
    data: [
      {
        name: "Alice Martin",
        email: "alice.martin@example.com",
        role: "ADMIN",
      },
      {
        name: "Bob Dupuis",
        email: "bob.dupuis@example.com",
        role: "DESIGNER",
      },
      {
        name: "Claire Rousseau",
        email: "claire.rousseau@example.com",
        role: "REVIEWER",
      },
      {
        name: "David Moreau",
        email: "david.moreau@example.com",
        role: "CONTRIBUTOR",
      },
      {
        name: "Emma Leroy",
        email: "emma.leroy@example.com",
        role: "GUEST",
      },
    ],
  });

  console.log(`✅ Created ${members.count} members`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
