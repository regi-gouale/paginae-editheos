"use client";

import { AlertCircle, Calendar, Clock, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRecentProjects } from "@/hooks/projects/use-recent-projects";
import { isProjectOverdueForDisplay } from "@/lib/utils";
import type { ProjectStatus } from "@/prisma/generated/prisma/client";

const statusConfig = {
  TODO: { label: "À faire", color: "bg-blue-100 text-blue-800" },
  IN_PROGRESS: { label: "En cours", color: "bg-orange-100 text-orange-800" },
  BLOCKED: { label: "Bloqué", color: "bg-red-100 text-red-800" },
  DONE: { label: "Terminé", color: "bg-green-100 text-green-800" },
  REJECTED: { label: "Rejeté", color: "bg-gray-100 text-gray-800" },
};

const priorityConfig = {
  LOW: { label: "Basse", color: "bg-gray-100 text-gray-800" },
  MEDIUM: { label: "Moyenne", color: "bg-yellow-100 text-yellow-800" },
  HIGH: { label: "Haute", color: "bg-orange-100 text-orange-800" },
  URGENT: { label: "Urgente", color: "bg-red-100 text-red-800" },
};

const typeConfig = {
  EDITION: { label: "Édition", color: "bg-purple-100 text-purple-800" },
  PRINTING: { label: "Impression", color: "bg-indigo-100 text-indigo-800" },
};

export default function RecentProjects() {
  const { projects, loading } = useRecentProjects(5);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatDueDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
    }).format(date);
  };

  const isOverdue = (dueDate?: Date, status?: ProjectStatus) => {
    return isProjectOverdueForDisplay(dueDate, status);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Projets récents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Projets récents</CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/projects">
            <ExternalLink className="size-4 mr-2" />
            Voir tous
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex items-start space-x-4 p-4 border rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium leading-none">{project.title}</h4>
                  {project.dueDate &&
                    isOverdue(project.dueDate, project.status) && (
                      <AlertCircle className="size-4 text-red-500" />
                    )}
                </div>

                <div className="flex items-center space-x-2">
                  <Badge
                    className={
                      statusConfig[project.status as keyof typeof statusConfig]
                        .color
                    }
                  >
                    {
                      statusConfig[project.status as keyof typeof statusConfig]
                        .label
                    }
                  </Badge>
                  <Badge className={priorityConfig[project.priority].color}>
                    {
                      priorityConfig[
                        project.priority as keyof typeof priorityConfig
                      ].label
                    }
                  </Badge>
                  <Badge className={typeConfig[project.type].color}>
                    {typeConfig[project.type as keyof typeof typeConfig].label}
                  </Badge>
                </div>

                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  {project.author && (
                    <div className="flex items-center space-x-2">
                      <Avatar className="size-5">
                        <AvatarImage src={project.author.image} />
                        <AvatarFallback className="text-xs">
                          {project.author.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span>{project.author.name}</span>
                    </div>
                  )}

                  {project.dueDate && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="size-4" />
                      <span
                        className={
                          isOverdue(
                            project.dueDate,
                            project.status as ProjectStatus,
                          )
                            ? "text-red-600 font-medium"
                            : ""
                        }
                      >
                        Échéance: {formatDueDate(project.dueDate)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center space-x-1">
                    <Clock className="size-4" />
                    <span>Modifié {formatDate(project.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
