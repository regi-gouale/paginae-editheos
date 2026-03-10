"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getRecentActivities,
  type ActivityItem,
} from "@/lib/actions/activity.action";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Edit,
  Plus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

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
    const loadActivities = async () => {
      setLoading(true);
      try {
        const data = await getRecentActivities(5);
        setActivities(data);
      } catch (error) {
        console.error("Erreur lors du chargement des activités:", error);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
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
          <Clock className="size-5" />
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
                }`}>
                <div className={`${config.bgColor} p-2 rounded-full`}>
                  <Icon className={`size-4 ${config.color}`} />
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
                      <Avatar className="size-5">
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
