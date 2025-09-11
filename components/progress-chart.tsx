"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

interface MonthlyData {
  month: string;
  completed: number;
  created: number;
  inProgress: number;
}

interface ProgressChartData {
  monthlyData: MonthlyData[];
  totalCompleted: number;
  totalCreated: number;
  trend: {
    value: number;
    direction: "up" | "down";
    period: string;
  };
}

export default function ProgressChart() {
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

  const maxValue = Math.max(
    ...data.monthlyData.map((d) =>
      Math.max(d.completed, d.created, d.inProgress)
    )
  );

  const completionRate =
    data.totalCreated > 0
      ? Math.round((data.totalCompleted / data.totalCreated) * 100)
      : 0;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progression mensuelle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="text-center space-y-2">
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Progression mensuelle</span>
        </CardTitle>
        <Badge
          variant={data.trend.direction === "up" ? "default" : "destructive"}
          className="flex items-center space-x-1"
        >
          {data.trend.direction === "up" ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          <span>
            {data.trend.direction === "up" ? "+" : "-"}
            {data.trend.value}%
          </span>
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Graphique en barres simplifié */}
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Projets par mois</span>
              <span>{data.trend.period}</span>
            </div>

            <div className="space-y-3">
              {data.monthlyData.slice(-6).map((month) => (
                <div key={month.month} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">{month.month}</span>
                    <span className="text-muted-foreground">
                      {month.completed}/{month.created} terminés
                    </span>
                  </div>
                  <div className="flex space-x-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="bg-green-500 transition-all duration-500"
                      style={{
                        width: `${(month.completed / maxValue) * 100}%`,
                      }}
                    />
                    <div
                      className="bg-orange-500 transition-all duration-500"
                      style={{
                        width: `${(month.inProgress / maxValue) * 100}%`,
                      }}
                    />
                    <div
                      className="bg-gray-300 transition-all duration-500"
                      style={{
                        width: `${
                          ((month.created -
                            month.completed -
                            month.inProgress) /
                            maxValue) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Statistiques résumées */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center space-y-1">
              <div className="text-2xl font-bold text-green-600">
                {data.totalCompleted}
              </div>
              <div className="text-xs text-muted-foreground">
                Projets terminés
              </div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-2xl font-bold text-blue-600">
                {data.totalCreated}
              </div>
              <div className="text-xs text-muted-foreground">Projets créés</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-2xl font-bold text-purple-600">
                {completionRate}%
              </div>
              <div className="text-xs text-muted-foreground">
                Taux de réussite
              </div>
            </div>
          </div>

          {/* Légende */}
          <div className="flex justify-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Terminés</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>En cours</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <span>À faire</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
