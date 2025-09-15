import { useEffect, useState } from "react";

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

export function useProgressChart() {
  const [data, setData] = useState<ProgressChartData>({
    monthlyData: [],
    totalCompleted: 0,
    totalCreated: 0,
    trend: { value: 0, direction: "up", period: "ce mois" },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulation de données - remplacer par un appel API réel
    const mockData: ProgressChartData = {
      monthlyData: [
        { month: "Jan", completed: 12, created: 15, inProgress: 8 },
        { month: "Fév", completed: 18, created: 20, inProgress: 12 },
        { month: "Mar", completed: 25, created: 28, inProgress: 15 },
        { month: "Avr", completed: 22, created: 25, inProgress: 18 },
        { month: "Mai", completed: 30, created: 32, inProgress: 20 },
        { month: "Jun", completed: 28, created: 35, inProgress: 22 },
        { month: "Jul", completed: 35, created: 38, inProgress: 25 },
        { month: "Aoû", completed: 32, created: 40, inProgress: 28 },
        { month: "Sep", completed: 15, created: 20, inProgress: 12 },
      ],
      totalCompleted: 217,
      totalCreated: 253,
      trend: { value: 15, direction: "up", period: "vs mois dernier" },
    };

    setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 1200);
  }, []);

  return { data, loading };
}
