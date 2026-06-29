import { useEffect, useState } from "react";
import {
  getProgressChartData,
  type MonthlyData,
  type ProgressChartData,
} from "@/lib/actions/progress.action";

export type { MonthlyData, ProgressChartData };

export function useProgressChart() {
  const [data, setData] = useState<ProgressChartData>({
    monthlyData: [],
    totalCompleted: 0,
    totalCreated: 0,
    trend: { value: 0, direction: "up", period: "ce mois" },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const progressData = await getProgressChartData();
        setData(progressData);
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
