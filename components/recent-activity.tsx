"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Edit,
  Plus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

interface ActivityItem {
  id: string;
  type:
    | "project_created"
    | "project_updated"
    | "project_completed"
    | "member_added"
    | "deadline_approaching";
  title: string;
  description: string;
  user?: {
    name: string;
    email: string;
    image?: string;
  };
  timestamp: Date;
  projectTitle?: string;
}

const activityConfig = {
  project_created: {
    icon: Plus,
    color: "text-green-600",
    bgColor: "bg-green-100",
    label: "Projet créé",
  },
  project_updated: {
    icon: Edit,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    label: "Projet modifié",
  },
  project_completed: {
    icon: CheckCircle,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
    label: "Projet terminé",
  },
  member_added: {
    icon: Users,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    label: "Membre ajouté",
  },
  deadline_approaching: {
    icon: AlertTriangle,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    label: "Échéance proche",
  },
};

export default function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulation de données - remplacer par un appel API réel
    const mockData: ActivityItem[] = [
      {
        id: "1",
        type: "project_created",
        title: "Nouveau projet créé",
        description: "Guide de l'édition numérique",
        user: {
          name: "Marie Dubois",
          email: "marie@example.com",
        },
        timestamp: new Date("2025-09-11T10:30:00"),
        projectTitle: "Guide de l'édition numérique",
      },
      {
        id: "2",
        type: "deadline_approaching",
        title: "Échéance dans 2 jours",
        description: "Catalogue produits 2025",
        timestamp: new Date("2025-09-11T09:15:00"),
        projectTitle: "Catalogue produits 2025",
      },
      {
        id: "3",
        type: "project_updated",
        title: "Statut mis à jour",
        description: "Manuel utilisateur v2.0 - Bloqué",
        user: {
          name: "Jean Martin",
          email: "jean@example.com",
        },
        timestamp: new Date("2025-09-10T16:45:00"),
        projectTitle: "Manuel utilisateur v2.0",
      },
      {
        id: "4",
        type: "member_added",
        title: "Nouveau membre",
        description: "Sophie Laurent a rejoint l'équipe",
        user: {
          name: "Admin",
          email: "admin@example.com",
        },
        timestamp: new Date("2025-09-10T14:20:00"),
      },
      {
        id: "5",
        type: "project_completed",
        title: "Projet terminé",
        description: "Brochure événement été 2025",
        user: {
          name: "Pierre Durand",
          email: "pierre@example.com",
        },
        timestamp: new Date("2025-09-09T11:30:00"),
        projectTitle: "Brochure événement été 2025",
      },
    ];

    setTimeout(() => {
      setActivities(mockData);
      setLoading(false);
    }, 800);
  }, []);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "À l'instant";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Il y a ${minutes} minute${minutes > 1 ? "s" : ""}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Il y a ${hours} heure${hours > 1 ? "s" : ""}`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `Il y a ${days} jour${days > 1 ? "s" : ""}`;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activité récente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start space-x-4 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Activité récente</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const config = activityConfig[activity.type];
            const Icon = config.icon;

            return (
              <div
                key={activity.id}
                className={`flex items-start space-x-4 pb-4 ${
                  index < activities.length - 1
                    ? "border-b border-gray-100"
                    : ""
                }`}
              >
                <div className={`${config.bgColor} p-2 rounded-full`}>
                  <Icon className={`h-4 w-4 ${config.color}`} />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <time className="text-xs text-muted-foreground">
                      {formatTimeAgo(activity.timestamp)}
                    </time>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {activity.description}
                  </p>

                  {activity.user && (
                    <div className="flex items-center space-x-2 mt-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={activity.user.image} />
                        <AvatarFallback className="text-xs">
                          {activity.user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        {activity.user.name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {config.label}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
