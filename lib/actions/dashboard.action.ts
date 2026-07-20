"use server";

import {
  getAccessContext,
  getProjectAssignmentScope,
} from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import type { ProjectStatus } from "@/prisma/generated/prisma/client";

// --- Types ---

export type DashboardStatsData = {
  overdue: number;
  dueSoon: number;
  blocked: number;
  inProgress: number;
  completionRate: number;
  completionTrend: {
    value: string;
    direction: "increase" | "decrease";
  };
  statusDistribution: {
    status: string;
    label: string;
    count: number;
    fill: string;
  }[];
};

// --- Actions ---

const STATUS_LABELS: Record<string, { label: string; fill: string }> = {
  TODO: { label: "A faire", fill: "var(--color-todo)" },
  IN_PROGRESS: { label: "En cours", fill: "var(--color-inProgress)" },
  BLOCKED: { label: "Bloque", fill: "var(--color-blocked)" },
  DONE: { label: "Termine", fill: "var(--color-done)" },
  REJECTED: { label: "Rejete", fill: "var(--color-rejected)" },
};

export async function getDashboardStats(): Promise<DashboardStatsData> {
  try {
    const access = await getAccessContext();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayPlus7 = new Date();
    todayPlus7.setDate(todayPlus7.getDate() + 7);
    todayPlus7.setHours(23, 59, 59, 999);

    const startOfThisMonth = new Date();
    startOfThisMonth.setDate(1);
    startOfThisMonth.setHours(0, 0, 0, 0);

    const startOfLastMonth = new Date();
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
    startOfLastMonth.setDate(1);
    startOfLastMonth.setHours(0, 0, 0, 0);

    const endOfLastMonth = new Date(startOfThisMonth);
    endOfLastMonth.setMilliseconds(-1);

    const activeStatuses: ProjectStatus[] = ["TODO", "IN_PROGRESS", "BLOCKED"];

    const projectScope = getProjectAssignmentScope(access);

    const [
      overdueCount,
      dueSoonCount,
      blockedCount,
      inProgressCount,
      totalProjects,
      completedProjects,
      completedThisMonth,
      completedLastMonth,
      projectsThisMonth,
      projectsLastMonth,
      statusCounts,
    ] = await Promise.all([
      // Projets en retard : date depassee, pas termines ni rejetes
      prisma.project.count({
        where: {
          ...projectScope,
          dueDate: { lt: startOfToday },
          status: { in: activeStatuses },
        },
      }),
      // Echeances dans les 7 prochains jours (non en retard)
      prisma.project.count({
        where: {
          ...projectScope,
          dueDate: { gte: startOfToday, lte: todayPlus7 },
          status: { in: activeStatuses },
        },
      }),
      prisma.project.count({
        where: { ...projectScope, status: "BLOCKED" },
      }),
      prisma.project.count({
        where: { ...projectScope, status: "IN_PROGRESS" },
      }),
      prisma.project.count({
        where: projectScope,
      }),
      prisma.project.count({
        where: { ...projectScope, status: "DONE" },
      }),
      prisma.project.count({
        where: {
          ...projectScope,
          status: "DONE",
          updatedAt: { gte: startOfThisMonth },
        },
      }),
      prisma.project.count({
        where: {
          ...projectScope,
          status: "DONE",
          updatedAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
      }),
      prisma.project.count({
        where: {
          ...projectScope,
          createdAt: { gte: startOfThisMonth },
        },
      }),
      prisma.project.count({
        where: {
          ...projectScope,
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
      }),
      // Distribution par statut
      prisma.project.groupBy({
        where: projectScope,
        by: ["status"],
        _count: { status: true },
      }),
    ]);

    const completionRate =
      totalProjects > 0
        ? Math.round((completedProjects / totalProjects) * 100)
        : 0;

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

    const statusDistribution = statusCounts.map((s) => ({
      status: s.status,
      label: STATUS_LABELS[s.status]?.label ?? s.status,
      count: s._count.status,
      fill: STATUS_LABELS[s.status]?.fill ?? "var(--color-muted)",
    }));

    return {
      overdue: overdueCount,
      dueSoon: dueSoonCount,
      blocked: blockedCount,
      inProgress: inProgressCount,
      completionRate,
      completionTrend: {
        value:
          completionRateChange > 0
            ? `+${completionRateChange}%`
            : `${completionRateChange}%`,
        direction: completionRateChange >= 0 ? "increase" : "decrease",
      },
      statusDistribution,
    };
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    return {
      overdue: 0,
      dueSoon: 0,
      blocked: 0,
      inProgress: 0,
      completionRate: 0,
      completionTrend: { value: "+0%", direction: "increase" },
      statusDistribution: [],
    };
  }
}
