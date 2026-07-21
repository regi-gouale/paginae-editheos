"use client";

import {
  IconAlertTriangle,
  IconCalendarClock,
  IconLock,
  IconTrendingUp,
} from "@tabler/icons-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useDashboardStats } from "@/hooks/dashboard/use-dashboard-stats";

export default function DashboardStats() {
  const { data, loading } = useDashboardStats();

  const kpiCards = [
    {
      title: "Projets en retard",
      value: data.overdue,
      icon: IconAlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      description:
        data.overdue > 0 ? "Nécessitent une action immédiate" : "Aucun retard",
    },
    {
      title: "Échéances proches",
      value: data.dueSoon,
      icon: IconCalendarClock,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      description: "Dans les 7 prochains jours",
    },
    {
      title: "Projets bloqués",
      value: data.blocked,
      icon: IconLock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description:
        data.blocked > 0 ? "En attente de déblocage" : "Aucun blocage",
    },
    {
      title: "Taux d'achèvement",
      value: `${data.completionRate}%`,
      icon: IconTrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      change: data.completionTrend.value,
      changeType: data.completionTrend.direction,
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {["s1", "s2", "s3", "s4"].map((skeletonId) => (
          <Card
            key={skeletonId}
            className="surface-card animate-pulse rounded-xl"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 rounded bg-muted"></div>
              <div className="size-4 rounded bg-muted"></div>
            </CardHeader>
            <CardContent>
              <div className="mb-2 h-8 w-16 rounded bg-muted"></div>
              <div className="h-3 w-32 rounded bg-muted"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
      {kpiCards.map((card) => (
        <StatsCard key={card.title} {...card} />
      ))}
    </div>
  );
}
