import { getProjectStats } from "@/lib/actions/kanban";
import { useEffect, useState } from "react";

export function useProjectStats() {
  const [stats, setStats] = useState({
    todo: 0,
    inProgress: 0,
    blocked: 0,
    dueToday: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const projectStats = await getProjectStats();
        setStats(projectStats);
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques:", error);
      }
    };
    fetchStats();
  }, []);

  return stats;
}
