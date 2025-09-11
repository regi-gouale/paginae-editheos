"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getProjectStats } from "@/lib/actions/kanban";
import {
  BookAlert,
  BookAudio,
  BookLock,
  BookOpen,
  FolderKanban,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

interface ProjectStats {
  todo: number;
  inProgress: number;
  blocked: number;
  dueToday: number;
}

interface DashboardData {
  stats: ProjectStats;
  totalProjects: number;
  totalMembers: number;
  completionRate: number;
}

export default function DashboardStats() {
  const [data, setData] = useState<DashboardData>({
    stats: { todo: 0, inProgress: 0, blocked: 0, dueToday: 0 },
    totalProjects: 0,
    totalMembers: 0,
    completionRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stats = await getProjectStats();
        const totalProjects = stats.todo + stats.inProgress + stats.blocked;
        const completionRate =
          totalProjects > 0
            ? Math.round((stats.inProgress / totalProjects) * 100)
            : 0;

        setData({
          stats,
          totalProjects,
          totalMembers: 0, // À implémenter avec une fonction pour compter les membres
          completionRate,
        });
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statsCards = [
    {
      title: "Projets à relire",
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
      title: "Échéances aujourd&apos;hui",
      value: data.stats.dueToday,
      icon: BookAlert,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "À finaliser aujourd&apos;hui",
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
      changeType: "positive" as const,
    },
    {
      title: "Membres de l&apos;équipe",
      value: data.totalMembers,
      icon: Users,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      change: "+2",
      changeType: "positive" as const,
    },
    {
      title: "Taux de progression",
      value: `${data.completionRate}%`,
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      change: "+5%",
      changeType: "positive" as const,
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
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
            const Icon = card.icon;
            return (
              <Card
                key={card.title}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {card.title}
                  </CardTitle>
                  <div className={`${card.bgColor} p-2 rounded-lg`}>
                    <Icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            );
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
            const Icon = card.icon;
            return (
              <Card
                key={card.title}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {card.title}
                  </CardTitle>
                  <div className={`${card.bgColor} p-2 rounded-lg`}>
                    <Icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Badge
                      variant={
                        card.changeType === "positive"
                          ? "default"
                          : "destructive"
                      }
                      className="text-xs"
                    >
                      {card.change}
                    </Badge>
                    <span>par rapport au mois dernier</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Barre de progression globale */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">
          Progression générale
        </h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Avancement des projets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progression globale</span>
                <span>{data.completionRate}%</span>
              </div>
              <Progress value={data.completionRate} className="h-2" />
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {data.stats.todo}
                </div>
                <div className="text-muted-foreground">À faire</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {data.stats.inProgress}
                </div>
                <div className="text-muted-foreground">En cours</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {data.stats.blocked}
                </div>
                <div className="text-muted-foreground">Bloqués</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
