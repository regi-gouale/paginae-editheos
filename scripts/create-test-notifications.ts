import { PrismaClient } from "@/prisma/generated/prisma/client";

const prisma = new PrismaClient({
  accelerateUrl: process.env.ACCELERATE_URL ?? process.env.DATABASE_URL!,
});

async function createTestNotifications() {
  try {
    // Récupérer le premier utilisateur et le premier projet
    const user = await prisma.user.findFirst();
    const project = await prisma.project.findFirst();

    if (!user) {
      console.log("Aucun utilisateur trouvé. Créez d'abord un utilisateur.");
      return;
    }

    if (!project) {
      console.log("Aucun projet trouvé. Créez d'abord un projet.");
      return;
    }

    // Créer des notifications de test
    const notifications = await Promise.all([
      prisma.notification.create({
        data: {
          userId: user.id,
          projectId: project.id,
          type: "PROJECT_CREATED",
          title: "📋 Nouveau projet : Test de notification",
          message:
            "Un nouveau projet de test a été créé pour tester les notifications.",
        },
      }),
      prisma.notification.create({
        data: {
          userId: user.id,
          projectId: project.id,
          type: "PROJECT_DUE_SOON",
          title: "⏰ Échéance proche : Test de notification",
          message: "Ce projet arrive à échéance bientôt.",
        },
      }),
      prisma.notification.create({
        data: {
          userId: user.id,
          type: "MEMBER_ADDED",
          title: "👥 Nouveau membre dans l'équipe",
          message: "Un nouveau membre a rejoint l'équipe Editheos.",
        },
      }),
      prisma.notification.create({
        data: {
          userId: user.id,
          projectId: project.id,
          type: "PROJECT_MOVED",
          title: "📋 Projet déplacé : " + project.title,
          message: `Le projet "${project.title}" a été déplacé vers "En cours".`,
        },
      }),
    ]);

    console.log(
      `✅ ${notifications.length} notifications de test créées avec succès !`,
    );
    console.log("Utilisateur:", user.email);
    console.log("Projet:", project.title);

    notifications.forEach((notif, index) => {
      console.log(`  ${index + 1}. ${notif.title}`);
    });
  } catch (error) {
    console.error(
      "❌ Erreur lors de la création des notifications de test:",
      error,
    );
  } finally {
    await prisma.$disconnect();
  }
}

createTestNotifications();
