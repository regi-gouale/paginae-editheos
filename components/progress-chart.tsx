"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProgressChart } from "@/hooks/dashboard/use-progress-chart";
import { Calendar, TrendingDown, TrendingUp } from "lucide-react";

// interface MonthlyData {
//   month: string;
//   completed: number;
//   created: number;
//   inProgress: number;
// }

export default function ProgressChart() {
  const { data, loading } = useProgressChart();
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
