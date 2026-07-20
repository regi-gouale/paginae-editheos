import { useEffect, useState } from "react";
import {
  type DashboardStatsData,
  getDashboardStats,
} from "@/lib/actions/dashboard.action";

export type { DashboardStatsData };

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
