import {
  createProjectNotificationForMembers,
  createUserNotification,
} from "@/lib/notifications-helpers";
import { PrismaClient } from "@/prisma/generated/prisma/client";

const prisma = new PrismaClient({
  ...(process.env.ACCELERATE_URL
    ? { accelerateUrl: process.env.ACCELERATE_URL }
    : {}),
});

async function testNotificationSystem() {
  try {
    console.log("🧪 Test du système de notifications...");

    // 1. Récupérer l'utilisateur actuel
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log("❌ Aucun utilisateur trouvé");
      return;
    }

    console.log("👤 Utilisateur:", user.email);

    // 2. Créer un projet de test
    const columnTodo = await prisma.kanbanColumn.findFirst({
      where: { title: "À faire" },
    });

    const project = await prisma.project.create({
      data: {
        title: "Test Notification Project",
        description: "Projet créé pour tester le système de notifications",
        columnId: columnTodo?.id,
        slug: `test-notification-${Date.now()}`,
      },
    });

    console.log("📋 Projet créé:", project.title);

    // 3. Créer une notification pour le créateur
    const creatorNotification = await createUserNotification(
      user.id,
      "PROJECT_CREATED",
      `✅ Projet créé : ${project.title}`,
      `Votre projet "${project.title}" a été créé avec succès.`,
      project.id,
    );

    console.log(
      "🔔 Notification créateur:",
      creatorNotification.success ? "✅" : "❌",
    );

    // 4. Vérifier les notifications en base
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    console.log(`📨 Notifications en base: ${notifications.length}`);
    notifications.forEach((notif, index) => {
      console.log(
        `  ${index + 1}. ${notif.title} (${notif.read ? "lu" : "non lu"})`,
      );
    });

    // 5. Test avec des membres (si il y en a)
    const members = await prisma.member.findMany({ take: 1 });
    if (members.length > 0) {
      // Assigner le membre au projet
      await prisma.project.update({
        where: { id: project.id },
        data: {
          members: {
            connect: members.map((m) => ({ id: m.id })),
          },
        },
      });

      // Créer notification pour les membres
      const memberNotification = await createProjectNotificationForMembers(
        project.id,
        "PROJECT_ASSIGNED",
        `👤 Assigné au projet : ${project.title}`,
        `Vous avez été assigné(e) au projet "${project.title}".`,
        user.id, // Exclure le créateur
      );

      console.log(
        "🔔 Notification membres:",
        memberNotification.success ? "✅" : "❌",
      );
    }

    console.log("✅ Test terminé avec succès!");
  } catch (error) {
    console.error("❌ Erreur lors du test:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testNotificationSystem();
