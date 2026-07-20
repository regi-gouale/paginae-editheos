"use server";

import { getAccessContext } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import type {
  Priority,
  ProjectStatus,
  ProjectType,
} from "@/prisma/generated/prisma/client";

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

export type AttentionProject = {
  id: string;
  title: string;
  slug: string | null;
  status: ProjectStatus;
  priority: Priority;
  type: ProjectType;
  dueDate: Date | null;
  reason: "overdue" | "due_soon" | "blocked";
  taskProgress: { total: number; completed: number };
};

export type TaskProgressProject = {
  id: string;
  title: string;
  slug: string | null;
  status: ProjectStatus;
  totalTasks: number;
  completedTasks: number;
  percentage: number;
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

    const projectScope = access.isAdmin
      ? {}
      : {
          members: {
            some: {
              userId: access.userId,
            },
          },
        };

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

export async function getProjectsNeedingAttention(): Promise<
  AttentionProject[]
> {
  try {
    const access = await getAccessContext();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayPlus7 = new Date();
    todayPlus7.setDate(todayPlus7.getDate() + 7);
    todayPlus7.setHours(23, 59, 59, 999);

    const activeStatuses: ProjectStatus[] = ["TODO", "IN_PROGRESS", "BLOCKED"];

    const projectScope = access.isAdmin
      ? {}
      : {
          members: {
            some: {
              userId: access.userId,
            },
          },
        };

    const [overdueProjects, dueSoonProjects, blockedProjects] =
      await Promise.all([
        prisma.project.findMany({
          where: {
            ...projectScope,
            dueDate: { lt: startOfToday },
            status: { in: activeStatuses },
          },
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            priority: true,
            type: true,
            dueDate: true,
            tasks: { select: { completed: true } },
          },
          orderBy: { dueDate: "asc" },
          take: 5,
        }),
        prisma.project.findMany({
          where: {
            ...projectScope,
            dueDate: { gte: startOfToday, lte: todayPlus7 },
            status: { in: activeStatuses },
          },
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            priority: true,
            type: true,
            dueDate: true,
            tasks: { select: { completed: true } },
          },
          orderBy: { dueDate: "asc" },
          take: 5,
        }),
        prisma.project.findMany({
          where: {
            ...projectScope,
            status: "BLOCKED",
          },
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            priority: true,
            type: true,
            dueDate: true,
            tasks: { select: { completed: true } },
          },
          orderBy: { updatedAt: "desc" },
          take: 5,
        }),
      ]);

    const mapProject = (
      p: (typeof overdueProjects)[number],
      reason: AttentionProject["reason"],
    ): AttentionProject => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      status: p.status,
      priority: p.priority,
      type: p.type,
      dueDate: p.dueDate,
      reason,
      taskProgress: {
        total: p.tasks.length,
        completed: p.tasks.filter((t) => t.completed).length,
      },
    });

    const seen = new Set<string>();
    const results: AttentionProject[] = [];

    // Priorite : en retard > echeance proche > bloque
    for (const p of overdueProjects) {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        results.push(mapProject(p, "overdue"));
      }
    }
    for (const p of dueSoonProjects) {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        results.push(mapProject(p, "due_soon"));
      }
    }
    for (const p of blockedProjects) {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        results.push(mapProject(p, "blocked"));
      }
    }

    return results.slice(0, 8);
  } catch (error) {
    console.error("Error getting projects needing attention:", error);
    return [];
  }
}

export async function getActiveTaskProgress(): Promise<TaskProgressProject[]> {
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

    const projects = await prisma.project.findMany({
      where: {
        ...projectScope,
        status: { in: ["TODO", "IN_PROGRESS"] },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        tasks: { select: { completed: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 8,
    });

    return projects
      .filter((p) => p.tasks.length > 0)
      .map((p) => {
        const total = p.tasks.length;
        const completed = p.tasks.filter((t) => t.completed).length;
        return {
          id: p.id,
          title: p.title,
          slug: p.slug,
          status: p.status,
          totalTasks: total,
          completedTasks: completed,
          percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
      })
      .sort((a, b) => b.percentage - a.percentage);
  } catch (error) {
    console.error("Error getting active task progress:", error);
    return [];
  }
}
