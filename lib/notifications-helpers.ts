import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@/prisma/generated/prisma/client";

/**
 * Fonction utilitaire pour créer des notifications pour un projet
 */
export async function createProjectNotificationForMembers(
  projectId: string,
  type: NotificationType,
  title: string,
  message: string,
  excludeUserId?: string,
) {
  try {
    // Récupérer le projet avec ses membres
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: true,
      },
    });

    if (!project) {
      return { success: false, error: "Projet non trouvé" };
    }

    // Récupérer les utilisateurs correspondant aux emails des membres
    const users = await prisma.user.findMany({
      where: {
        email: {
          in: project.members.map((member) => member.email),
        },
        ...(excludeUserId && {
          id: {
            not: excludeUserId,
          },
        }),
      },
    });

    // Créer une notification pour chaque utilisateur
    const notifications = await Promise.all(
      users.map((user) =>
        prisma.notification.create({
          data: {
            userId: user.id,
            projectId,
            type,
            title,
            message,
          },
        }),
      ),
    );

    return { success: true, notifications };
  } catch (error) {
    console.error(
      "Erreur lors de la création des notifications de projet:",
      error,
    );
    return { success: false, error: "Impossible de créer les notifications" };
  }
}

/**
 * Fonction utilitaire pour créer une notification pour un utilisateur spécifique
 */
export async function createUserNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  projectId?: string,
) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        projectId,
      },
    });

    return { success: true, notification };
  } catch (error) {
    console.error(
      "Erreur lors de la création de la notification utilisateur:",
      error,
    );
    return { success: false, error: "Impossible de créer la notification" };
  }
}

/**
 * Fonction utilitaire pour créer des notifications d'échéance
 */
export async function createDueDateNotifications() {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Projets qui arrivent à échéance demain
    const projectsDueSoon = await prisma.project.findMany({
      where: {
        dueDate: {
          gte: today,
          lte: tomorrow,
        },
        status: {
          not: "DONE",
        },
      },
      include: {
        members: true,
      },
    });

    // Projets en retard
    const overdueProjects = await prisma.project.findMany({
      where: {
        dueDate: {
          lt: today,
        },
        status: {
          not: "DONE",
        },
      },
      include: {
        members: true,
      },
    });

    // Créer les notifications pour les projets qui arrivent à échéance
    for (const project of projectsDueSoon) {
      await createProjectNotificationForMembers(
        project.id,
        "PROJECT_DUE_SOON",
        `📅 Échéance proche : ${project.title}`,
        `Le projet "${project.title}" arrive à échéance demain.`,
      );
    }

    // Créer les notifications pour les projets en retard
    for (const project of overdueProjects) {
      await createProjectNotificationForMembers(
        project.id,
        "PROJECT_OVERDUE",
        `🚨 Projet en retard : ${project.title}`,
        `Le projet "${project.title}" a dépassé sa date d'échéance.`,
      );
    }

    return {
      success: true,
      dueSoonCount: projectsDueSoon.length,
      overdueCount: overdueProjects.length,
    };
  } catch (error) {
    console.error(
      "Erreur lors de la création des notifications d'échéance:",
      error,
    );
    return {
      success: false,
      error: "Impossible de créer les notifications d'échéance",
    };
  }
}
