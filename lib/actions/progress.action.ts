"use server";

import { getAccessContext } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import { ProjectStatus } from "@/prisma/generated/prisma/client";

export interface MonthlyData {
  month: string;
  completed: number;
  created: number;
  inProgress: number;
}

export interface ProgressChartData {
  monthlyData: MonthlyData[];
  totalCompleted: number;
  totalCreated: number;
  trend: {
    value: number;
    direction: "up" | "down";
    period: string;
  };
}

export async function getProgressChartData(): Promise<ProgressChartData> {
  try {
    const access = await getAccessContext();

    const projectScope = access.isAdmin
      ? {}
      : {
          members: {
            some: {
              userId: access.userId,
            },
          },
        };

    // Récupérer les 12 derniers mois
    const monthsAgo = new Date();
    monthsAgo.setMonth(monthsAgo.getMonth() - 12);

    const allProjects = await prisma.project.findMany({
      where: {
        ...projectScope,
        createdAt: {
          gte: monthsAgo,
        },
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Créer un tableau des 12 derniers mois
    const months = [];
    const monthLabels = [
      "Jan",
      "Fév",
      "Mar",
      "Avr",
      "Mai",
      "Jun",
      "Jul",
      "Aoû",
      "Sep",
      "Oct",
      "Nov",
      "Déc",
    ];

    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      months.push({
        date,
        label: monthLabels[date.getMonth()],
        year: date.getFullYear(),
        month: date.getMonth(),
      });
    }

    // Calculer les statistiques par mois
    const monthlyData: MonthlyData[] = months.map(({ label, month, year }) => {
      const created = allProjects.filter((p) => {
        const projectDate = new Date(p.createdAt);
        return (
          projectDate.getMonth() === month && projectDate.getFullYear() === year
        );
      }).length;

      const completed = allProjects.filter((p) => {
        const projectDate = new Date(p.updatedAt);
        return (
          p.status === ProjectStatus.DONE &&
          projectDate.getMonth() === month &&
          projectDate.getFullYear() === year
        );
      }).length;

      const inProgress = allProjects.filter((p) => {
        const projectDate = new Date(p.createdAt);
        return (
          p.status === ProjectStatus.IN_PROGRESS &&
          projectDate.getMonth() === month &&
          projectDate.getFullYear() === year
        );
      }).length;

      return {
        month: label,
        created,
        completed,
        inProgress,
      };
    });

    // Calculer le total de projets terminés et créés
    const totalCompleted = await prisma.project.count({
      where: {
        ...projectScope,
        status: ProjectStatus.DONE,
      },
    });

    const totalCreated = await prisma.project.count({ where: projectScope });

    // Calculer la tendance (comparaison du mois actuel avec le précédent)
    const currentMonth = monthlyData[monthlyData.length - 1];
    const previousMonth = monthlyData[monthlyData.length - 2];

    let trend = {
      value: 0,
      direction: "up" as "up" | "down",
      period: "vs mois dernier",
    };

    if (previousMonth && previousMonth.completed > 0) {
      const difference = currentMonth.completed - previousMonth.completed;
      const percentage = Math.abs(
        Math.round((difference / previousMonth.completed) * 100),
      );
      trend = {
        value: percentage,
        direction: difference >= 0 ? "up" : "down",
        period: "vs mois dernier",
      };
    } else if (currentMonth.completed > 0) {
      trend = {
        value: 100,
        direction: "up",
        period: "vs mois dernier",
      };
    }

    return {
      monthlyData,
      totalCompleted,
      totalCreated,
      trend,
    };
  } catch (error) {
    console.error("Error fetching progress chart data:", error);
    return {
      monthlyData: [],
      totalCompleted: 0,
      totalCreated: 0,
      trend: { value: 0, direction: "up", period: "ce mois" },
    };
  }
}
