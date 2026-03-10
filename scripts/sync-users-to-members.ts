import { PrismaClient } from "@/prisma/generated/prisma";
import { generateMemberSlug } from "@/lib/utils";

const prisma = new PrismaClient();

async function syncUsersToMembers() {
  console.log("🔄 Synchronisation des utilisateurs vers les membres...\n");

  try {
    // Récupérer tous les utilisateurs
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        member: true,
      },
    });

    console.log(`📊 ${users.length} utilisateur(s) trouvé(s)\n`);

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const user of users) {
      // Vérifier si l'utilisateur a déjà un membre lié
      if (user.member) {
        console.log(`⏭️  Ignoré: ${user.email} (membre déjà lié)`);
        skipped++;
        continue;
      }

      // Vérifier s'il existe déjà un membre avec cet email
      const existingMember = await prisma.member.findUnique({
        where: { email: user.email },
      });

      if (existingMember) {
        // Lier le membre existant à l'utilisateur
        try {
          await prisma.member.update({
            where: { id: existingMember.id },
            data: { userId: user.id },
          });
          console.log(`🔗 Lié: ${user.email} avec membre existant`);
          created++;
        } catch (error) {
          console.error(
            `❌ Erreur lors de la liaison de ${user.email}:`,
            error,
          );
          errors++;
        }
      } else {
        // Créer un nouveau membre pour cet utilisateur
        try {
          const slug = generateMemberSlug(user.name);
          await prisma.member.create({
            data: {
              email: user.email,
              name: user.name,
              role: "CONTRIBUTOR", // Rôle par défaut
              slug,
              userId: user.id,
            },
          });
          console.log(`✅ Créé: ${user.email} (nouveau membre)`);
          created++;
        } catch (error) {
          console.error(
            `❌ Erreur lors de la création du membre pour ${user.email}:`,
            error,
          );
          errors++;
        }
      }
    }

    console.log("\n📈 Résumé:");
    console.log(`  ✅ Créés/Liés: ${created}`);
    console.log(`  ⏭️  Ignorés: ${skipped}`);
    console.log(`  ❌ Erreurs: ${errors}`);
    console.log("\n✨ Synchronisation terminée!");
  } catch (error) {
    console.error("❌ Erreur lors de la synchronisation:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
syncUsersToMembers()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script échoué:", error);
    process.exit(1);
  });
