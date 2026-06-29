"use server";

import { revalidatePath } from "next/cache";
import { getCurrentSession } from "@/lib/auth/auth-lib";
import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@/prisma/generated/prisma/client";

/**
 * Fonction utilitaire pour obtenir l'utilisateur actuel ou échouer
 */
async function getRequiredUser() {
  const session = await getCurrentSession();
  if (!session?.user) {
    throw new Error("Non authentifié");
  }
  return session.user;
}

/**
 * Créer une nouvelle notification
 */
export async function createNotificationAction(
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

    revalidatePath("/dashboard");
    return { success: true, notification };
  } catch (error) {
    console.error("Erreur lors de la création de la notification:", error);
    return { success: false, error: "Impossible de créer la notification" };
  }
}

/**
 * Créer une notification pour tous les membres d'un projet
 */
export async function createProjectNotificationAction(
  projectId: string,
  type: NotificationType,
  title: string,
  message: string,
  excludeUserId?: string,
) {
  try {
    // Récupérer tous les utilisateurs ayant un email correspondant aux membres du projet
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

    revalidatePath("/dashboard");
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
 * Récupérer les notifications d'un utilisateur
 */
export async function getUserNotificationsAction() {
  try {
    const user = await getRequiredUser();

    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id,
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, notifications };
  } catch (error) {
    console.error("Erreur lors de la récupération des notifications:", error);
    return {
      success: false,
      error: "Impossible de récupérer les notifications",
    };
  }
}

/**
 * Marquer une notification comme lue
 */
export async function markNotificationAsReadAction(notificationId: string) {
  try {
    const user = await getRequiredUser();

    const notification = await prisma.notification.update({
      where: {
        id: notificationId,
        userId: user.id, // S'assurer que l'utilisateur possède la notification
      },
      data: {
        read: true,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, notification };
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la notification:", error);
    return {
      success: false,
      error: "Impossible de mettre à jour la notification",
    };
  }
}

/**
 * Marquer toutes les notifications comme lues
 */
export async function markAllNotificationsAsReadAction() {
  try {
    const user = await getRequiredUser();

    await prisma.notification.updateMany({
      where: {
        userId: user.id,
        read: false,
      },
      data: {
        read: true,
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la mise à jour des notifications:", error);
    return {
      success: false,
      error: "Impossible de mettre à jour les notifications",
    };
  }
}

/**
 * Supprimer une notification
 */
export async function deleteNotificationAction(notificationId: string) {
  try {
    const user = await getRequiredUser();

    await prisma.notification.delete({
      where: {
        id: notificationId,
        userId: user.id, // S'assurer que l'utilisateur possède la notification
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la suppression de la notification:", error);
    return { success: false, error: "Impossible de supprimer la notification" };
  }
}

/**
 * Récupérer le nombre de notifications non lues
 */
export async function getUnreadNotificationsCountAction() {
  try {
    const user = await getRequiredUser();

    const count = await prisma.notification.count({
      where: {
        userId: user.id,
        read: false,
      },
    });

    return { success: true, count };
  } catch (error) {
    console.error("Erreur lors du comptage des notifications:", error);
    return { success: false, error: "Impossible de compter les notifications" };
  }
}
