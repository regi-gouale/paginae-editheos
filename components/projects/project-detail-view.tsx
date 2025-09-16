"use client";

import { ProjectDescriptionDialog } from "@/components/projects/description-dialog";
import ProjectTitleEditor from "@/components/projects/input-title";
import { ProjectTasksEditor } from "@/components/projects/tasks-editor";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  formatDateLong,
  getColumnNameFromProjectStatus,
  getPriorityLabel,
  getStatusVariant,
  projectTypes,
} from "@/lib/utils";
import { ProjectWithDetails } from "@/types/kanban";
import {
  ArrowLeft,
  CalendarIcon,
  ExternalLinkIcon,
  MailIcon,
} from "lucide-react";
import Link from "next/link";
import { ProjectCustomFieldsEditor } from "./custom-fields-editor";
import { ProjectFileUrlEditor } from "./file-url-editor";

interface ProjectDetailViewProps {
  project: ProjectWithDetails;
}

export function ProjectDetailView({ project }: ProjectDetailViewProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getMemberInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getProgressPercentage = () => {
    if (!project.tasks || project.tasks.length === 0) return 0;
    const completedTasks = project.tasks.filter(
      (task) => task.completed
    ).length;
    return Math.round((completedTasks / project.tasks.length) * 100);
  };

  return (
    <div className="space-y-6 w-full">
      {/* En-tête du projet */}
      <div className="flex items-start justify-between w-full">
        <div className="space-y-2 w-full">
          <div className="flex items-center gap-3 w-full">
            <Button asChild variant="ghost" className="rounded-full mr-4">
              <Link href="/dashboard/projects">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>

            <Badge
              variant={getStatusVariant(project.status)}
              className="rounded-full"
            >
              {getColumnNameFromProjectStatus(project.status)}
            </Badge>
            <ProjectTitleEditor
              title={project.title}
              projectId={project.id}
              isDetailView
            />
          </div>
          {project.description && (
            <ProjectDescriptionDialog
              projectId={project.id}
              description={project.description}
              isDetailView
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations générales */}
          <Card>
            <CardHeader>
              <CardTitle
                style={{
                  fontFamily: "var(--font-montserrat)",
                }}
              >
                Informations générales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Type
                  </Label>
                  <p className="">
                    {projectTypes[project.type] || "Non défini"}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Priorité
                  </Label>
                  <p>{getPriorityLabel(project.priority)}</p>
                </div>

                {project.dueDate && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Date d&apos;échéance
                    </Label>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      <p>{formatDateLong(project.dueDate)}</p>
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Statut Kanban
                  </Label>
                  <p>{project.kanbanColumn?.title || "Non assigné"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tâches */}
          {project.tasks && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Tâches ({project.tasks.length})
                  <Badge variant="outline" className="rounded-full">
                    {getProgressPercentage()}% terminé
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProjectTasksEditor
                  tasks={project.tasks}
                  projectId={project.id}
                  isDetailView
                />
              </CardContent>
            </Card>
          )}

          {/* Champs personnalisés */}
          {project.customFields && (
            <Card>
              <CardHeader>
                <CardTitle>Champs personnalisés</CardTitle>
              </CardHeader>
              <CardContent>
                <ProjectCustomFieldsEditor
                  projectId={project.id}
                  customFields={project.customFields}
                  isDetailView
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Auteurs */}
          {project.authors && project.authors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Auteur
                  {project.authors.length > 1
                    ? "s ({project.authors.length})"
                    : ""}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project.authors.map((author) => (
                    <div key={author.id} className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {getInitials(author.firstName, author.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">
                          {author.firstName} {author.lastName}
                        </p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MailIcon className="h-3 w-3" />
                          <span>{author.email}</span>
                        </div>
                        {author.website && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <ExternalLinkIcon className="h-3 w-3" />
                            <a
                              href={author.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              Site web
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Membres de l'équipe */}
          {project.members && project.members.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Équipe ({project.members.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project.members.map((member) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {getMemberInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{member.name}</p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MailIcon className="h-3 w-3" />
                          <span>{member.email}</span>
                        </div>
                        <Badge variant="outline" className="text-xs mt-1">
                          {member.role}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Métadonnées */}
          <Card>
            <CardHeader>
              <CardTitle>Métadonnées</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ProjectFileUrlEditor
                projectId={project.id}
                fileUrl={project.fileUrl || ""}
                isDetailView
              />
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Créé le
                </Label>
                <p className="text-sm">{formatDateLong(project.createdAt)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Dernière modification
                </Label>
                <p className="text-sm">{formatDateLong(project.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
