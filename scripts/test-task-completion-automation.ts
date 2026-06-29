import { prisma } from "@/lib/prisma";
import { ProjectStatus } from "@/prisma/generated/prisma/client";

/**
 * Script de test pour valider l'automatisation "une tâche complétée = passage en En cours"
 */
async function testTaskCompletionAutomation() {
  console.log("🧪 Test de l'automatisation - Tâche complétée -> En cours");

  try {
    // 1. Créer un projet en statut "À faire" avec des tâches
    const testProject = await prisma.project.create({
      data: {
        title: "Test Automatisation - Tâche complétée",
        description: "Projet de test pour valider l'automatisation",
        status: ProjectStatus.TODO,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Dans 7 jours
        columnId: null, // Sera défini par l'automatisation
        tasks: {
          create: [
            {
              title: "Tâche 1 - Non complétée",
              completed: false,
            },
            {
              title: "Tâche 2 - À compléter",
              completed: false,
            },
            {
              title: "Tâche 3 - Non complétée",
              completed: false,
            },
          ],
        },
      },
      include: {
        tasks: true,
      },
    });

    console.log(`✅ Projet créé: ${testProject.title} (ID: ${testProject.id})`);
    console.log(`📋 Statut initial: ${testProject.status}`);
    console.log(`📝 Tâches créées: ${testProject.tasks.length}`);

    // 2. Marquer une tâche comme complétée
    const taskToComplete = testProject.tasks[1]; // Tâche 2
    await prisma.projectTask.update({
      where: { id: taskToComplete.id },
      data: { completed: true },
    });

    console.log(`✅ Tâche "${taskToComplete.title}" marquée comme complétée`);

    // 3. Récupérer le projet mis à jour pour voir l'état actuel
    const updatedProject = await prisma.project.findUnique({
      where: { id: testProject.id },
      include: {
        tasks: true,
        kanbanColumn: true,
      },
    });

    if (updatedProject) {
      console.log(`📊 Statut actuel: ${updatedProject.status}`);
      console.log(
        `📋 Colonne actuelle: ${updatedProject.kanbanColumn?.title || "Aucune"}`,
      );
      console.log(
        `✅ Tâches complétées: ${
          updatedProject.tasks.filter((t) => t.completed).length
        }/${updatedProject.tasks.length}`,
      );

      // L'automatisation devrait se déclencher dans le board Kanban
      // Ce script ne teste que la création, l'automatisation se déclenche côté client
      console.log(
        "\n⚠️  Note: L'automatisation se déclenche dans le composant Board Kanban côté client",
      );
      console.log(
        "💡 Pour tester, ouvrez le dashboard et observez si le projet passe automatiquement en 'En cours'",
      );
    }

    console.log(`\n🗑️  Suppression du projet de test...`);
    await prisma.project.delete({
      where: { id: testProject.id },
    });
    console.log("✅ Projet de test supprimé");
  } catch (error) {
    console.error("❌ Erreur lors du test:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le test
testTaskCompletionAutomation();
