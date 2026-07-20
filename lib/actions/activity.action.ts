"use server";

import {
  getAccessContext,
  getProjectAssignmentScope,
} from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import { ProjectStatus } from "@/prisma/generated/prisma/client";

export type ActivityType =
  | "project_created"
  | "project_updated"
  | "project_completed"
  | "member_added"
  | "deadline_approaching";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  user?: {
    name: string;
    email: string;
    image?: string;
  };
  timestamp: Date;
  projectTitle?: string;
}

export async function getRecentActivities(limit = 10): Promise<ActivityItem[]> {
  try {
    const access = await getAccessContext();
    const activities: ActivityItem[] = [];

    const projectScope = getProjectAssignmentScope(access);

    // Récupérer les projets récemment créés (derniers 7 jours)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentlyCreatedProjects = await prisma.project.findMany({
      where: {
        ...projectScope,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        members: {
          select: {
            name: true,
            email: true,
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    for (const project of recentlyCreatedProjects) {
      activities.push({
        id: `created-${project.id}`,
        type: "project_created",
        title: "Nouveau projet créé",
        description: project.title,
        user: project.members[0]
          ? {
              name: project.members[0].name,
              email: project.members[0].email,
            }
          : undefined,
        timestamp: project.createdAt,
        projectTitle: project.title,
      });
    }

    // Récupérer les projets récemment mis à jour (derniers 3 jours, excluant ceux créés)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const recentlyUpdatedProjects = await prisma.project.findMany({
      where: {
        ...projectScope,
        updatedAt: {
          gte: threeDaysAgo,
        },
        createdAt: {
          lt: threeDaysAgo,
        },
      },
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true,
        members: {
          select: {
            name: true,
            email: true,
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 5,
    });

    const statusLabels: Record<ProjectStatus, string> = {
      TODO: "À faire",
      IN_PROGRESS: "En cours",
      BLOCKED: "Bloqué",
      DONE: "Terminé",
      REJECTED: "Rejeté",
    };

    for (const project of recentlyUpdatedProjects) {
      activities.push({
        id: `updated-${project.id}`,
        type: "project_updated",
        title: "Statut mis à jour",
        description: `${project.title} - ${statusLabels[project.status]}`,
        user: project.members[0]
          ? {
              name: project.members[0].name,
              email: project.members[0].email,
            }
          : undefined,
        timestamp: project.updatedAt,
        projectTitle: project.title,
      });
    }

    // Récupérer les projets récemment terminés (derniers 7 jours)
    const recentlyCompletedProjects = await prisma.project.findMany({
      where: {
        ...projectScope,
        status: ProjectStatus.DONE,
        updatedAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        id: true,
        title: true,
        updatedAt: true,
        members: {
          select: {
            name: true,
            email: true,
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 3,
    });

    for (const project of recentlyCompletedProjects) {
      activities.push({
        id: `completed-${project.id}`,
        type: "project_completed",
        title: "Projet terminé",
        description: project.title,
        user: project.members[0]
          ? {
              name: project.members[0].name,
              email: project.members[0].email,
            }
          : undefined,
        timestamp: project.updatedAt,
        projectTitle: project.title,
      });
    }

    // Récupérer les projets avec échéance proche (dans les 3 prochains jours)
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const upcomingDeadlines = await prisma.project.findMany({
      where: {
        ...projectScope,
        dueDate: {
          gte: now,
          lte: threeDaysFromNow,
        },
        status: {
          notIn: [ProjectStatus.DONE, ProjectStatus.REJECTED],
        },
      },
      select: {
        id: true,
        title: true,
        dueDate: true,
        updatedAt: true,
      },
      orderBy: {
        dueDate: "asc",
      },
      take: 3,
    });

    for (const project of upcomingDeadlines) {
      if (project.dueDate) {
        const daysUntil = Math.ceil(
          (project.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );
        activities.push({
          id: `deadline-${project.id}`,
          type: "deadline_approaching",
          title: `Échéance dans ${daysUntil} jour${daysUntil > 1 ? "s" : ""}`,
          description: project.title,
          timestamp: project.updatedAt,
          projectTitle: project.title,
        });
      }
    }

    // Récupérer les membres récemment ajoutés (derniers 7 jours)
    if (access.isAdmin) {
      const recentMembers = await prisma.member.findMany({
        where: {
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 3,
      });

      for (const member of recentMembers) {
        activities.push({
          id: `member-${member.id}`,
          type: "member_added",
          title: "Nouveau membre",
          description: `${member.name} a rejoint l'équipe`,
          user: {
            name: "Admin",
            email: "admin@example.com",
          },
          timestamp: member.createdAt,
        });
      }
    }

    // Trier par timestamp décroissant et limiter
    const sortedActivities = activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);

    return sortedActivities;
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    return [];
  }
}
