"use server";

import { prisma } from "@/lib/prisma";

export interface DashboardStatsData {
  stats: {
    todo: number;
    inProgress: number;
    blocked: number;
    dueSoon: number;
    completed: number;
  };
  totalProjects: number;
  totalMembers: number;
  completionRate: number;
  trends: {
    projectsChange: {
      value: string;
      direction: "increase" | "decrease";
    };
    membersChange: {
      value: string;
      direction: "increase" | "decrease";
    };
    completionRateChange: {
      value: string;
      direction: "increase" | "decrease";
    };
  };
}

export async function getDashboardStats(): Promise<DashboardStatsData> {
  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayPlus7 = new Date();
    todayPlus7.setDate(todayPlus7.getDate() + 7);
    todayPlus7.setHours(23, 59, 59, 999);

    // Calculer les dates pour le mois précédent
    const startOfThisMonth = new Date();
    startOfThisMonth.setDate(1);
    startOfThisMonth.setHours(0, 0, 0, 0);

    const startOfLastMonth = new Date();
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
    startOfLastMonth.setDate(1);
    startOfLastMonth.setHours(0, 0, 0, 0);

    const endOfLastMonth = new Date(startOfThisMonth);
    endOfLastMonth.setMilliseconds(-1);

    // Récupérer les colonnes avec leur comptage
    const columns = await prisma.$transaction([
      prisma.kanbanColumn.findFirst({
        where: { title: "À faire" },
        include: { _count: { select: { projects: true } } },
      }),
      prisma.kanbanColumn.findFirst({
        where: { title: "En cours" },
        include: { _count: { select: { projects: true } } },
      }),
      prisma.kanbanColumn.findFirst({
        where: { title: "Bloqué" },
        include: { _count: { select: { projects: true } } },
      }),
      prisma.kanbanColumn.findFirst({
        where: { title: "Terminé" },
        include: { _count: { select: { projects: true } } },
      }),
    ]);

    const [todoColumn, inProgressColumn, blockedColumn, completedColumn] =
      columns;

    const stats = {
      todo: todoColumn?._count?.projects || 0,
      inProgress: inProgressColumn?._count?.projects || 0,
      blocked: blockedColumn?._count?.projects || 0,
      completed: completedColumn?._count?.projects || 0,
      dueSoon: 0,
    };

    // Récupérer les comptages
    const [
      dueSoonCount,
      totalMembers,
      totalProjects,
      projectsThisMonth,
      projectsLastMonth,
      membersLastMonth,
      completedThisMonth,
      completedLastMonth,
    ] = await Promise.all([
      prisma.project.count({
        where: {
          dueDate: {
            gte: startOfToday,
            lte: todayPlus7,
          },
        },
      }),
      prisma.member.count(),
      prisma.project.count(),
      prisma.project.count({
        where: {
          createdAt: {
            gte: startOfThisMonth,
          },
        },
      }),
      prisma.project.count({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
      }),
      prisma.member.count({
        where: {
          createdAt: {
            lt: startOfThisMonth,
          },
        },
      }),
      prisma.project.count({
        where: {
          status: "DONE",
          updatedAt: {
            gte: startOfThisMonth,
          },
        },
      }),
      prisma.project.count({
        where: {
          status: "DONE",
          updatedAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
      }),
    ]);

    stats.dueSoon = dueSoonCount;

    // Calculer le taux de complétion
    const completionRate =
      totalProjects > 0
        ? Math.round((stats.completed / totalProjects) * 100)
        : 0;

    // Calculer les tendances
    const projectsChange =
      projectsLastMonth > 0
        ? Math.round(
            ((projectsThisMonth - projectsLastMonth) / projectsLastMonth) * 100,
          )
        : projectsThisMonth > 0
          ? 100
          : 0;

    const membersChange = totalMembers - membersLastMonth;

    const completionRateThisMonth =
      projectsThisMonth > 0
        ? Math.round((completedThisMonth / projectsThisMonth) * 100)
        : 0;
    const completionRateLastMonth =
      projectsLastMonth > 0
        ? Math.round((completedLastMonth / projectsLastMonth) * 100)
        : 0;
    const completionRateChange =
      completionRateThisMonth - completionRateLastMonth;

    return {
      stats,
      totalProjects,
      totalMembers,
      completionRate,
      trends: {
        projectsChange: {
          value:
            projectsChange > 0 ? `+${projectsChange}%` : `${projectsChange}%`,
          direction: projectsChange >= 0 ? "increase" : "decrease",
        },
        membersChange: {
          value: membersChange > 0 ? `+${membersChange}` : `${membersChange}`,
          direction: membersChange >= 0 ? "increase" : "decrease",
        },
        completionRateChange: {
          value:
            completionRateChange > 0
              ? `+${completionRateChange}%`
              : `${completionRateChange}%`,
          direction: completionRateChange >= 0 ? "increase" : "decrease",
        },
      },
    };
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    return {
      stats: {
        todo: 0,
        inProgress: 0,
        blocked: 0,
        dueSoon: 0,
        completed: 0,
      },
      totalProjects: 0,
      totalMembers: 0,
      completionRate: 0,
      trends: {
        projectsChange: { value: "+0%", direction: "increase" },
        membersChange: { value: "+0", direction: "increase" },
        completionRateChange: { value: "+0%", direction: "increase" },
      },
    };
  }
}
