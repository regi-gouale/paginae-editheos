import { getProjectStatusFromColumnName } from "@/lib/utils";
import { PrismaClient } from "@/prisma/generated/prisma/client";

const prisma = new PrismaClient({ accelerateUrl: process.env.ACCELERATE_URL ?? process.env.DATABASE_URL! });

async function fixProjectStatusInconsistency() {
  console.log("🔍 Recherche des incohérences entre statuts et colonnes...");

  try {
    // Récupérer tous les projets avec leurs colonnes
    const projects = await prisma.project.findMany({
      include: {
        kanbanColumn: true,
      },
    });

    let fixedCount = 0;
    const inconsistentProjects = [];

    for (const project of projects) {
      if (project.kanbanColumn) {
        const expectedStatus = getProjectStatusFromColumnName(
          project.kanbanColumn.title
        );

        if (project.status !== expectedStatus) {
          inconsistentProjects.push({
            id: project.id,
            title: project.title,
            currentStatus: project.status,
            expectedStatus,
            columnTitle: project.kanbanColumn.title,
          });
        }
      }
    }

    if (inconsistentProjects.length === 0) {
      console.log("✅ Aucune incohérence détectée !");
      return;
    }

    console.log(
      `📋 ${inconsistentProjects.length} incohérence(s) détectée(s) :`
    );
    inconsistentProjects.forEach((project) => {
      console.log(
        `   - "${project.title}": ${project.currentStatus} → ${project.expectedStatus} (colonne: ${project.columnTitle})`
      );
    });

    console.log("\n🔧 Correction en cours...");

    // Corriger chaque projet
    for (const project of inconsistentProjects) {
      await prisma.project.update({
        where: { id: project.id },
        data: { status: project.expectedStatus },
      });
      fixedCount++;
    }

    console.log(`✅ ${fixedCount} projet(s) corrigé(s) avec succès !`);
  } catch (error) {
    console.error("❌ Erreur lors de la correction :", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  fixProjectStatusInconsistency();
}

export default fixProjectStatusInconsistency;
