"use client";

import {
  IconArrowLeft,
  IconExternalLink,
  IconMail,
  IconTrash,
} from "@tabler/icons-react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProjectDescriptionDialog } from "@/components/projects/description-dialog";
import ProjectTitleEditor from "@/components/projects/input-title";
import { ProjectTasksEditor } from "@/components/projects/tasks-editor";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAlerts } from "@/hooks/use-alerts";
import { deleteProject } from "@/lib/actions/kanban";
import {
  formatDateLong,
  getColumnNameFromProjectStatus,
  getPriorityLabel,
  getStatusVariant,
  projectTypes,
} from "@/lib/utils";
import type { ProjectWithDetails } from "@/types/kanban";
import { ProjectCommentsEditor } from "./comments-editor";
import { ProjectCustomFieldsEditor } from "./custom-fields-editor";
import { ProjectFileUrlEditor } from "./file-url-editor";
import { DeadlineSelectorPopover } from "./popover-due-date";
import { ProjectMembersSelector } from "./select-members";
import { ProjectStatusDropdown } from "./select-project-status";

interface ProjectDetailViewProps {
  project: ProjectWithDetails;
  isAdmin: boolean;
  canEditProject: boolean;
  canEditStatus: boolean;
  canComment: boolean;
  canEditDesign: boolean;
}

export function ProjectDetailView({
  project,
  isAdmin,
  canEditProject,
  canEditStatus,
  canComment,
  canEditDesign,
}: ProjectDetailViewProps) {
  const router = useRouter();
  const { showError, showSuccess } = useAlerts();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [members, setMembers] = useState(project.members ?? []);

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
      (task) => task.completed,
    ).length;
    return Math.round((completedTasks / project.tasks.length) * 100);
  };

  const handleDeleteProject = async () => {
    setIsDeleting(true);

    try {
      const result = await deleteProject(project.id);

      if (result.success) {
        setIsDeleteDialogOpen(false);
        showSuccess("Projet supprimé avec succès");
        router.push("/dashboard/projects");
        router.refresh();
      } else {
        showError("Erreur lors de la suppression", result.error);
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      showError(
        "Erreur lors de la suppression",
        "Une erreur inattendue s'est produite",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* En-tête du projet */}
      <div className="flex items-start justify-between w-full">
        <div className="space-y-2 w-full">
          <div className="flex items-center gap-3 w-full">
            <Button asChild variant="ghost" className="rounded-full mr-4">
              <Link href="/dashboard/projects">
                <IconArrowLeft className="size-4" />
              </Link>
            </Button>

            <Badge
              variant={getStatusVariant(project.status)}
              className="rounded-full"
            >
              {getColumnNameFromProjectStatus(project.status)}
            </Badge>
            {!canEditProject ? (
              <Badge variant="outline" className="rounded-full">
                Lecture seule
              </Badge>
            ) : null}
            <ProjectTitleEditor
              title={project.title}
              projectId={project.id}
              slug={project.slug || undefined}
              isDetailView
              canEdit={canEditProject}
            />

            {isAdmin && (
              <AlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isDeleting}
                    className="ml-auto rounded-full"
                  >
                    <IconTrash className="size-4" />
                    Supprimer
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-4xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer ce projet ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action est irréversible. Le projet &quot;
                      {project.title}&quot; et ses données associées seront
                      supprimés définitivement.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel
                      className="rounded-full"
                      disabled={isDeleting}
                    >
                      Annuler
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={isDeleting}
                      onClick={(event) => {
                        event.preventDefault();
                        void handleDeleteProject();
                      }}
                    >
                      {isDeleting
                        ? "Suppression..."
                        : "Supprimer définitivement"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          {(project.description || canEditDesign || canEditProject) && (
            <ProjectDescriptionDialog
              projectId={project.id}
              description={project.description}
              isDetailView
              canEdit={canEditDesign || canEditProject}
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

                {canEditProject ? (
                  <DeadlineSelectorPopover
                    projectId={project.id}
                    dueDate={project.dueDate}
                    isDetailView
                    // onDueDateChange={handleDueDateUpdate}
                  />
                ) : (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Date d&apos;échéance
                    </Label>
                    <p>
                      {project.dueDate
                        ? formatDateLong(project.dueDate)
                        : "Non définie"}
                    </p>
                  </div>
                )}

                <div>
                  {project.status && canEditStatus ? (
                    <ProjectStatusDropdown
                      projectId={project.id}
                      status={project.status}
                      canValidate={isAdmin}
                    />
                  ) : (
                    <>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Statut
                      </Label>
                      <p>{getColumnNameFromProjectStatus(project.status)}</p>
                    </>
                  )}
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
                {canEditProject ? (
                  <ProjectTasksEditor
                    tasks={project.tasks}
                    projectId={project.id}
                    isDetailView
                  />
                ) : (
                  <div className="space-y-2">
                    {project.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span>{task.completed ? "✓" : "○"}</span>
                        <span>{task.title}</span>
                      </div>
                    ))}
                  </div>
                )}
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
                {canEditProject ? (
                  <ProjectCustomFieldsEditor
                    projectId={project.id}
                    customFields={project.customFields}
                    isDetailView
                  />
                ) : (
                  <div className="space-y-2">
                    {project.customFields.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Aucun champ personnalisé
                      </p>
                    ) : (
                      project.customFields.map((field) => (
                        <div key={field.id} className="text-sm">
                          <span className="font-medium">{field.name}: </span>
                          <span>{field.value}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Historique des commentaires</CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectCommentsEditor
                projectId={project.id}
                canComment={canComment}
              />
            </CardContent>
          </Card>
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
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">
                          {author.firstName} {author.lastName}
                        </p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <IconMail className="h-3 w-3" />
                          <span className="truncate">{author.email}</span>
                        </div>
                        {author.website && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <IconExternalLink className="h-3 w-3" />
                            <Link
                              href={author.website as Route}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              Site web
                            </Link>
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
          {(members.length > 0 || isAdmin) && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <CardTitle>Membres ({members.length})</CardTitle>
                {isAdmin ? (
                  <ProjectMembersSelector
                    projectId={project.id}
                    selectedMembers={members}
                    onMembersUpdated={setMembers}
                  />
                ) : null}
              </CardHeader>
              <CardContent>
                {members.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Aucun collaborateur assigné à ce projet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {getMemberInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{member.name}</p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <IconMail className="h-3 w-3" />
                            <span>{member.email}</span>
                          </div>
                          <Badge variant="outline" className="text-xs mt-1">
                            {member.role}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                canEdit={canEditDesign || canEditProject}
                // isDetailView
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
