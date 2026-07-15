import { prisma } from "@/lib/prisma";

async function createOverdueTestProject() {
  console.log(
    "🔧 Création d'un projet en retard pour tester les règles d'automatisation...",
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

    // Date d'échéance dans le passé (il y a 3 jours)
    const pastDueDate = new Date();
    pastDueDate.setDate(pastDueDate.getDate() - 3);

    // Créer un projet de test en retard
    const project = await prisma.project.create({
      data: {
        title: "Projet en retard - Test automatisation",
        description:
          "Ce projet a une échéance dépassée et devrait être déplacé vers 'Bloqué'",
        status: "IN_PROGRESS",
        columnId: inProgressColumn.id,
        priority: "HIGH",
        type: "EDITION",
        dueDate: pastDueDate,
      },
    });

    // Ajouter quelques tâches non complétées
    await Promise.all([
      prisma.projectTask.create({
        data: {
          title: "Tâche en attente 1",
          completed: false,
          projectId: project.id,
        },
      }),
      prisma.projectTask.create({
        data: {
          title: "Tâche en attente 2",
          completed: false,
          projectId: project.id,
        },
      }),
    ]);

    console.log(`✅ Projet en retard créé avec ID: ${project.id}`);
    console.log(`📅 Date d'échéance: ${pastDueDate.toLocaleDateString()}`);
    console.log(
      "🎯 Ce projet devrait être automatiquement déplacé vers 'Bloqué' lors du prochain chargement du board",
    );
  } catch (error) {
    console.error("❌ Erreur lors de la création du projet en retard :", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  createOverdueTestProject();
}

export default createOverdueTestProject;
