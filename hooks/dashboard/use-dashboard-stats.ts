import {
  getDashboardStats,
  getProjectsNeedingAttention,
  getActiveTaskProgress,
  type DashboardStatsData,
  type AttentionProject,
  type TaskProgressProject,
} from "@/lib/actions/dashboard.action";
import { useEffect, useState } from "react";

export type { DashboardStatsData, AttentionProject, TaskProgressProject };

const defaultStats: DashboardStatsData = {
  overdue: 0,
  dueSoon: 0,
  blocked: 0,
  inProgress: 0,
  completionRate: 0,
  completionTrend: { value: "+0%", direction: "increase" },
  statusDistribution: [],
};

export function useDashboardStats() {
  const [data, setData] = useState<DashboardStatsData>(defaultStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const statsData = await getDashboardStats();
        setData(statsData);
      } catch (error) {
        console.error("Erreur lors du chargement des donnees:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { data, loading };
}

export function useProjectsAttention() {
  const [projects, setProjects] = useState<AttentionProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getProjectsNeedingAttention();
        setProjects(data);
      } catch (error) {
        console.error("Erreur lors du chargement des projets:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { projects, loading };
}

export function useActiveTaskProgress() {
  const [projects, setProjects] = useState<TaskProgressProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getActiveTaskProgress();
        setProjects(data);
      } catch (error) {
        console.error("Erreur lors du chargement des taches:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { projects, loading };
}
