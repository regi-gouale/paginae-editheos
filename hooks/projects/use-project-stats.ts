import { useEffect, useState } from "react";
import { getProjectStats } from "@/lib/actions/kanban";

export function useProjectStats() {
  const [stats, setStats] = useState({
    todo: 0,
    inProgress: 0,
    blocked: 0,
    dueSoon: 0,
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
