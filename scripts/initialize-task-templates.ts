import { PrismaClient } from "@/prisma/generated/prisma/client";

const prisma = new PrismaClient({
  accelerateUrl: process.env.ACCELERATE_URL ?? process.env.DATABASE_URL!,
});

/**
 * Script pour initialiser les templates de tâches par défaut
 */
async function initializeTaskTemplates() {
  console.log("🔧 Initialisation des templates de tâches par défaut...");

  try {
    // Vérifier si des templates existent déjà
    const existingTemplates = await prisma.taskTemplate.count();

    if (existingTemplates > 0) {
      console.log(
        `ℹ️  ${existingTemplates} template(s) déjà présent(s). Aucune action nécessaire.`,
      );
      return;
    }

    // Templates par défaut pour les projets d'EDITION
    const editionTemplates = [
      "Réception du manuscrit",
      "Première lecture éditoriale",
      "Signature du contrat",
      "Correction éditoriale",
      "Validation du texte final",
      "Création de la couverture",
      "Validation de la couverture",
      "Mise en page / Maquette",
      "Relecture BAT (Bon à Tirer)",
      "Impression",
      "Publication et diffusion",
    ];

    // Templates par défaut pour les projets d'IMPRESSION
    const printingTemplates = [
      "Réception du fichier",
      "Vérification technique",
      "Validation du devis",
      "Préparation de l'impression",
      "Impression",
      "Contrôle qualité",
      "Façonnage / Reliure",
      "Emballage",
      "Expédition",
    ];

    // Créer les templates pour EDITION
    await prisma.taskTemplate.createMany({
      data: editionTemplates.map((title, index) => ({
        title,
        projectType: "EDITION",
        order: index,
      })),
    });

    console.log(
      `✅ ${editionTemplates.length} templates créés pour les projets d'édition`,
    );

    // Créer les templates pour PRINTING
    await prisma.taskTemplate.createMany({
      data: printingTemplates.map((title, index) => ({
        title,
        projectType: "PRINTING",
        order: index,
      })),
    });

    console.log(
      `✅ ${printingTemplates.length} templates créés pour les projets d'impression`,
    );
    console.log(`✅ Initialisation terminée avec succès !`);
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation des templates:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  initializeTaskTemplates();
}

export default initializeTaskTemplates;
