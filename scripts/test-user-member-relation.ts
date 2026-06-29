import { PrismaClient } from "@/prisma/generated/prisma/client";

const prisma = new PrismaClient({
  accelerateUrl: process.env.ACCELERATE_URL ?? process.env.DATABASE_URL!,
});

async function testUserMemberRelation() {
  console.log("🧪 Test de la relation User ↔ Member\n");

  try {
    // Test 1: Récupérer un utilisateur avec son membre
    console.log("📋 Test 1: Récupération d'un utilisateur avec son membre");
    const userWithMember = await prisma.user.findFirst({
      include: {
        member: true,
      },
    });

    if (userWithMember) {
      console.log(`✅ Utilisateur trouvé: ${userWithMember.email}`);
      if (userWithMember.member) {
        console.log(
          `✅ Membre lié: ${userWithMember.member.name} (${userWithMember.member.role})`,
        );
      } else {
        console.log(
          `⚠️  Aucun membre lié. Exécutez: pnpm sync-users-to-members`,
        );
      }
    } else {
      console.log("ℹ️  Aucun utilisateur trouvé dans la base de données");
    }

    console.log("\n" + "─".repeat(60) + "\n");

    // Test 2: Récupérer un membre avec son utilisateur
    console.log("📋 Test 2: Récupération d'un membre avec son utilisateur");
    const memberWithUser = await prisma.member.findFirst({
      include: {
        user: true,
      },
    });

    if (memberWithUser) {
      console.log(`✅ Membre trouvé: ${memberWithUser.name}`);
      if (memberWithUser.user) {
        console.log(
          `✅ Utilisateur lié: ${memberWithUser.user.email} (ID: ${memberWithUser.user.id})`,
        );
      } else {
        console.log(`⚠️  Aucun utilisateur lié`);
      }
    } else {
      console.log("ℹ️  Aucun membre trouvé dans la base de données");
    }

    console.log("\n" + "─".repeat(60) + "\n");

    // Test 3: Compter les utilisateurs et membres
    console.log("📋 Test 3: Comptage");
    const [totalUsers, totalMembers, membersWithUsers, usersWithMembers] =
      await Promise.all([
        prisma.user.count(),
        prisma.member.count(),
        prisma.member.count({ where: { userId: { not: null } } }),
        prisma.user.count({ where: { member: { isNot: null } } }),
      ]);

    console.log(`📊 Total utilisateurs: ${totalUsers}`);
    console.log(`📊 Total membres: ${totalMembers}`);
    console.log(`🔗 Membres avec utilisateur lié: ${membersWithUsers}`);
    console.log(`🔗 Utilisateurs avec membre lié: ${usersWithMembers}`);

    const usersWithoutMembers = totalUsers - usersWithMembers;
    if (usersWithoutMembers > 0) {
      console.log(`\n⚠️  ${usersWithoutMembers} utilisateur(s) sans membre lié`);
      console.log(`💡 Exécutez: pnpm sync-users-to-members`);
    } else {
      console.log(`\n✅ Tous les utilisateurs ont un membre lié !`);
    }

    console.log("\n✨ Tests terminés!");
  } catch (error) {
    console.error("❌ Erreur lors des tests:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter les tests
testUserMemberRelation()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Tests échoués:", error);
    process.exit(1);
  });
