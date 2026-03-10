import { PrismaClient } from "@/prisma/generated/prisma/client";

const prisma = new PrismaClient({ accelerateUrl: process.env.ACCELERATE_URL ?? process.env.DATABASE_URL! });

async function createTestProjectWithTasks() {
  console.log(
    "🔧 Création d'un projet de test pour les règles d'automatisation..."
  );

  try {
    // Trouver la colonne "En cours"
    const inProgressColumn = await prisma.kanbanColumn.findFirst({
      where: { title: "En cours" },
    });

    if (!inProgressColumn) {
      console.error("❌ Colonne 'En cours' non trouvée");
      return;
    }

    // Créer un projet de test
    const project = await prisma.project.create({
      data: {
        title: "Projet de test - Règles automatiques",
        description: "Ce projet sert à tester les règles d'automatisation",
        status: "IN_PROGRESS",
        columnId: inProgressColumn.id,
        priority: "MEDIUM",
        type: "EDITION",
      },
    });

    // Ajouter plusieurs tâches complétées
    await Promise.all([
      prisma.projectTask.create({
        data: {
          title: "Tâche 1 - Complétée",
          completed: true,
          projectId: project.id,
        },
      }),
      prisma.projectTask.create({
        data: {
          title: "Tâche 2 - Complétée",
          completed: true,
          projectId: project.id,
        },
      }),
      prisma.projectTask.create({
        data: {
          title: "Tâche 3 - Complétée",
          completed: true,
          projectId: project.id,
        },
      }),
    ]);

    console.log(`✅ Projet de test créé avec ID: ${project.id}`);
    console.log("📋 3 tâches complétées ajoutées");
    console.log(
      "🎯 Ce projet devrait être automatiquement déplacé vers 'Terminé' lors du prochain chargement du board"
    );
  } catch (error) {
    console.error("❌ Erreur lors de la création du projet de test :", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  createTestProjectWithTasks();
}

export default createTestProjectWithTasks;
