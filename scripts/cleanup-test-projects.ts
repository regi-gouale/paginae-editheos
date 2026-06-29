import { PrismaClient } from "@/prisma/generated/prisma/client";

const prisma = new PrismaClient({
  accelerateUrl: process.env.ACCELERATE_URL ?? process.env.DATABASE_URL!,
});

async function cleanupTestProjects() {
  console.log("🧹 Nettoyage des projets de test...");

  try {
    // Supprimer tous les projets qui contiennent "test" dans le titre
    const testProjects = await prisma.project.findMany({
      where: {
        OR: [
          { title: { contains: "test", mode: "insensitive" } },
          { title: { contains: "Test", mode: "insensitive" } },
          { description: { contains: "test", mode: "insensitive" } },
          { description: { contains: "Test", mode: "insensitive" } },
        ],
      },
    });

    if (testProjects.length === 0) {
      console.log("✅ Aucun projet de test à supprimer");
      return;
    }

    console.log(`📋 ${testProjects.length} projet(s) de test trouvé(s) :`);
    testProjects.forEach((project) => {
      console.log(`   - "${project.title}" (ID: ${project.id})`);
    });

    // Supprimer les tâches associées en premier (cascade devrait le faire, mais soyons sûrs)
    for (const project of testProjects) {
      await prisma.projectTask.deleteMany({
        where: { projectId: project.id },
      });
    }

    // Supprimer les projets de test
    const deleteResult = await prisma.project.deleteMany({
      where: {
        id: {
          in: testProjects.map((p) => p.id),
        },
      },
    });

    console.log(
      `✅ ${deleteResult.count} projet(s) de test supprimé(s) avec succès !`,
    );
  } catch (error) {
    console.error("❌ Erreur lors du nettoyage :", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  cleanupTestProjects();
}

export default cleanupTestProjects;
