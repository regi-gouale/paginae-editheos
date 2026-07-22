"use client";

import {
  IconAlertCircle,
  IconCalendar,
  IconClock,
  IconExternalLink,
} from "@tabler/icons-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRecentProjects } from "@/hooks/projects/use-recent-projects";
import { isProjectOverdueForDisplay } from "@/lib/utils";
import type { ProjectStatus } from "@/prisma/generated/prisma/client";
import { Separator } from "../ui/separator";

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
      <Card className="surface-card rounded-4xl">
        <CardHeader>
          <CardTitle>Projets récents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {["s1", "s2", "s3"].map((skeletonId) => (
              <div key={skeletonId} className="animate-pulse">
                <div className="mb-2 h-4 w-3/4 rounded-full bg-muted"></div>
                <div className="h-3 w-1/2 rounded-full bg-muted"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (projects.length === 0) {
    return (
      <Card className="surface-card rounded-4xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Projets récents</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Aucun projet récent pour le moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="surface-card glow-subtle rounded-4xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Projets récents</CardTitle>
        <Button variant="outline" size="sm" asChild className="rounded-full">
          <Link href="/dashboard/projects">
            <IconExternalLink className="size-4 mr-2" />
            Voir tous
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {projects.map((project, index) => (
            <div key={project.id}>
              <div className="flex items-start gap-4 rounded-4xl border-border/60 p-2 transition-colors hover:bg-muted/40">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium leading-none">
                      {project.title}
                    </h4>
                    {project.dueDate &&
                      isOverdue(project.dueDate, project.status) && (
                        <IconAlertCircle className="size-4 text-red-500" />
                      )}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge
                      className={
                        statusConfig[
                          project.status as keyof typeof statusConfig
                        ].color
                      }
                    >
                      {
                        statusConfig[
                          project.status as keyof typeof statusConfig
                        ].label
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
                      {
                        typeConfig[project.type as keyof typeof typeConfig]
                          .label
                      }
                    </Badge>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {project.author && (
                      <div className="flex items-center gap-2">
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
                      <div className="flex items-center gap-1">
                        <IconCalendar className="size-4" />
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

                    <div className="flex items-center gap-1">
                      <IconClock className="size-4" />
                      <span>Modifié {formatDate(project.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
              {index < projects.length - 1 && (
                <Separator
                  orientation="horizontal"
                  className="border-border/60 my-2"
                />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
