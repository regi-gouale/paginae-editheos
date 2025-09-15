import { getProjectStats } from "@/lib/actions/kanban";
import { useEffect, useState } from "react";

interface ProjectStats {
  todo: number;
  inProgress: number;
  blocked: number;
  dueToday: number;
  completed?: number;
  totalMembers?: number;
}

interface DashboardData {
  stats: ProjectStats;
  totalProjects: number;
  totalMembers: number;
  completed: number;
  completionRate: number;
}

export function useDashboardStats() {
  const [data, setData] = useState<DashboardData>({
    stats: { todo: 0, inProgress: 0, blocked: 0, dueToday: 0 },
    totalProjects: 0,
    totalMembers: 0,
    completed: 0,
    completionRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stats = await getProjectStats();
        const totalProjects = stats.todo + stats.inProgress + stats.blocked;
        const completionRate =
          totalProjects > 0
            ? Math.round((stats.completed / totalProjects) * 100)
            : 0;
        const totalMembers = stats.totalMembers || 0;

        setData({
          stats,
          totalProjects,
          totalMembers,
          completed: stats.completed,
          completionRate,
        });
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { data, loading };
}
