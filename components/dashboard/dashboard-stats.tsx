"use client";

import { AlertTriangle, CalendarClock, Lock, TrendingUp } from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useDashboardStats } from "@/hooks/dashboard/use-dashboard-stats";

export default function DashboardStats() {
  const { data, loading } = useDashboardStats();

  const kpiCards = [
    {
      title: "Projets en retard",
      value: data.overdue,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      description:
        data.overdue > 0 ? "Necessitent une action immediate" : "Aucun retard",
    },
    {
      title: "Echeances proches",
      value: data.dueSoon,
      icon: CalendarClock,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      description: "Dans les 7 prochains jours",
    },
    {
      title: "Projets bloques",
      value: data.blocked,
      icon: Lock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description:
        data.blocked > 0 ? "En attente de deblocage" : "Aucun blocage",
    },
    {
      title: "Taux d'achevement",
      value: `${data.completionRate}%`,
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      change: data.completionTrend.value,
      changeType: data.completionTrend.direction,
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {["s1", "s2", "s3", "s4"].map((skeletonId) => (
          <Card key={skeletonId} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 rounded w-24 bg-muted"></div>
              <div className="size-4 rounded bg-muted"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 rounded w-16 mb-2 bg-muted"></div>
              <div className="h-3 rounded w-32 bg-muted"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpiCards.map((card) => (
        <StatsCard key={card.title} {...card} />
      ))}
    </div>
  );
}
