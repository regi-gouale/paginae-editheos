import {
  getDashboardStats,
  type DashboardStatsData,
} from "@/lib/actions/dashboard.action";
import { useEffect, useState } from "react";

export type { DashboardStatsData };

export function useDashboardStats() {
  const [data, setData] = useState<DashboardStatsData>({
    stats: { todo: 0, inProgress: 0, blocked: 0, dueSoon: 0, completed: 0 },
    totalProjects: 0,
    totalMembers: 0,
    completionRate: 0,
    trends: {
      projectsChange: { value: "+0%", direction: "increase" },
      membersChange: { value: "+0", direction: "increase" },
      completionRateChange: { value: "+0%", direction: "increase" },
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const statsData = await getDashboardStats();
        setData(statsData);
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
