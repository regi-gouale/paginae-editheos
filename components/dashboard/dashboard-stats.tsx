"use client";

import { ProjectGlobalProgressBar } from "@/components/dashboard/project-global-progressbar";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useDashboardStats } from "@/hooks/dashboard/use-dashboard-stats";
import {
  BookAlert,
  BookAudio,
  BookLock,
  BookOpen,
  FolderKanban,
  TrendingUp,
  Users,
} from "lucide-react";

// interface ProjectStats {
//   todo: number;
//   inProgress: number;
//   blocked: number;
//   dueToday: number;
// }

export default function DashboardStats() {
  const { data, loading } = useDashboardStats();

  const statsCards = [
    {
      title: "Projets à faire",
      value: data.stats.todo,
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "En attente de révision",
    },
    {
      title: "Projets en cours",
      value: data.stats.inProgress,
      icon: BookAudio,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description: "Actuellement en développement",
    },
    {
      title: "Projets bloqués",
      value: data.stats.blocked,
      icon: BookLock,
      color: "text-red-600",
      bgColor: "bg-red-50",
      description: "Nécessitent une attention",
    },
    {
      title: "Échéances aujourd'hui",
      value: data.stats.dueToday,
      icon: BookAlert,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "À finaliser aujourd'hui",
    },
  ];

  const overviewCards = [
    {
      title: "Total des projets",
      value: data.totalProjects,
      icon: FolderKanban,
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: "+12%",
      changeType: "increase" as const,
    },
    {
      title: "Membres de l'équipe",
      value: data.totalMembers,
      icon: Users,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      change: "+2",
      changeType: "increase" as const,
    },
    {
      title: "Taux de progression",
      value: `${data.completionRate}%`,
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      change: "+5%",
      changeType: "increase" as const,
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="size-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques principales */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">
          Aperçu des projets
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((card) => {
            return <StatsCard key={card.title} {...card} />;
          })}
        </div>
      </div>

      {/* Vue d'ensemble */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">
          Vue d&apos;ensemble
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {overviewCards.map((card) => {
            return <StatsCard key={card.title} {...card} />;
          })}
        </div>
      </div>

      {/* Barre de progression globale */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">
          Progression générale
        </h2>
        <ProjectGlobalProgressBar
          stats={data.stats}
          completionRate={data.completionRate}
        />
      </div>
    </div>
  );
}
