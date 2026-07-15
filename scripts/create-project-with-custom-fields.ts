import { prisma } from "@/lib/prisma";

async function createProjectWithCustomFields() {
  console.log("🔧 Création d'un projet avec champs personnalisés...");

  try {
    // Trouver la colonne "À faire"
    const todoColumn = await prisma.kanbanColumn.findFirst({
      where: { title: "À faire" },
    });

    if (!todoColumn) {
      console.error("❌ Colonne 'À faire' non trouvée");
      return;
    }

    // Créer un projet de test
    const project = await prisma.project.create({
      data: {
        title: "Projet Test - Champs Personnalisés",
        description:
          "Ce projet sert à tester l'édition des champs personnalisés",
        status: "TODO",
        columnId: todoColumn.id,
        priority: "MEDIUM",
        type: "EDITION",
      },
    });

    // Ajouter plusieurs champs personnalisés
    await Promise.all([
      prisma.customField.create({
        data: {
          name: "Budget",
          value: "15000€",
          projectId: project.id,
        },
      }),
      prisma.customField.create({
        data: {
          name: "Client",
          value: "Entreprise ABC",
          projectId: project.id,
        },
      }),
      prisma.customField.create({
        data: {
          name: "Deadline interne",
          value: "30 septembre 2025",
          projectId: project.id,
        },
      }),
      prisma.customField.create({
        data: {
          name: "Responsable",
          value: "Jean Dupont",
          projectId: project.id,
        },
      }),
    ]);

    console.log(`✅ Projet créé avec ID: ${project.id}`);
    console.log("📋 4 champs personnalisés ajoutés");
    console.log(
      "🎯 Vous pouvez maintenant tester l'édition des champs en cliquant sur les badges",
    );
  } catch (error) {
    console.error("❌ Erreur lors de la création du projet :", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  createProjectWithCustomFields();
}

export default createProjectWithCustomFields;
