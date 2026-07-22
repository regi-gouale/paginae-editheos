"use client";

import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ProjectDetailDialog } from "@/components/projects/detail-dialog";
import { KanbanColumn } from "@/components/projects/kanban-column";
import { ProjectFilters } from "@/components/projects/project-filters";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProjectFilters } from "@/hooks/projects/use-project-filters";
import { applyAutomationRules, updateProject } from "@/lib/actions/kanban";
import { filterKanbanColumns } from "@/lib/project-filters";
import { getRules, shouldMoveProject } from "@/lib/rules";
import { getProjectStatusFromColumnName } from "@/lib/utils";
import type {
  KanbanColumnWithProjects,
  ProjectWithDetails,
} from "@/types/kanban";

interface ProjectsBoardProps {
  initialColumns: KanbanColumnWithProjects[];
  isAdmin: boolean;
  canCreateProject: boolean;
  canMoveProject: boolean;
  canEditProject: boolean;
  canEditStatus: boolean;
  canEditDesign: boolean;
  canComment: boolean;
}

export function ProjectsBoard({
  initialColumns,
  isAdmin,
  canCreateProject,
  canMoveProject,
  canEditProject,
  canEditStatus,
  canEditDesign,
  canComment,
}: ProjectsBoardProps) {
  const [columns, setColumns] =
    useState<KanbanColumnWithProjects[]>(initialColumns);
  const [selectedProject, setSelectedProject] =
    useState<ProjectWithDetails | null>(null);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [moveComment, setMoveComment] = useState("");
  const [isMoveSaving, setIsMoveSaving] = useState(false);
  const [pendingMove, setPendingMove] = useState<{
    draggableId: string;
    sourceId: string;
    destinationId: string;
    destinationIndex: number;
  } | null>(null);

  // Utiliser le hook nuqs pour les filtres
  const { filters, updateFilters, getFilteredUrl } = useProjectFilters();

  // Appliquer les filtres aux colonnes
  const filteredColumns = useMemo(() => {
    return filterKanbanColumns(columns, filters);
  }, [columns, filters]);

  // Define some example rules
  // In a real application, these would likely come from props or context

  useEffect(() => {
    if (initialColumns.length === 0) return;
    setColumns(initialColumns);
  }, [initialColumns]);

  useEffect(() => {
    if (columns.length === 0) return;

    const rules = getRules(columns);
    const enabledRules = rules.filter((rule) => rule.enabled);

    if (enabledRules.length === 0) return;

    const projectsToMove: {
      projectId: string;
      sourceColumnId: string;
      targetColumnId: string;
    }[] = [];

    // Parcourir tous les projets de toutes les colonnes
    columns.forEach((column) => {
      column.projects.forEach((project) => {
        enabledRules.forEach((rule) => {
          // Utiliser la nouvelle fonction shouldMoveProject pour déterminer si le projet doit être déplacé
          if (shouldMoveProject(project, rule) && rule.action?.targetColumnId) {
            const targetColumn = columns.find(
              (col) => col.id === rule.action?.targetColumnId,
            );

            // Vérifier que le projet n'est pas déjà dans la colonne cible
            if (targetColumn && column.id !== rule.action.targetColumnId) {
              projectsToMove.push({
                projectId: project.id,
                sourceColumnId: column.id,
                targetColumnId: rule.action.targetColumnId,
              });
            }
          }
        });
      });
    });

    // Appliquer les déplacements si nécessaire
    if (projectsToMove.length > 0) {
      // Préparer les données pour l'action d'automatisation
      const automationData = projectsToMove.map(
        ({ projectId, targetColumnId }) => ({
          projectId,
          targetColumnId,
        }),
      );

      // Appliquer les règles d'automatisation en base de données
      applyAutomationRules(automationData)
        .then((results) => {
          results.forEach((result) => {
            if (result.success) {
              toast.info("Règle d'automatisation appliquée", {
                description: `"${
                  "project" in result ? result.project?.title : "Projet"
                }" déplacé automatiquement vers ${
                  "targetColumnTitle" in result
                    ? result.targetColumnTitle
                    : "nouvelle colonne"
                }`,
              });
            } else {
              toast.error("Erreur lors de l'application de la règle", {
                description: `Impossible de déplacer le projet : ${
                  "error" in result ? result.error : "Erreur inconnue"
                }`,
              });
            }
          });
        })
        .catch((error) => {
          toast.error("Erreur lors de l'application des règles", {
            description: `Erreur générale : ${error.message}`,
          });
        });
    }
  }, [columns]);

  const handleDragEnd = async (result: DropResult) => {
    if (!canMoveProject) {
      toast.error("Vous n'avez pas la permission de déplacer ce projet");
      return;
    }

    const { destination, source, draggableId } = result;
    // Si pas de destination ou déplacement au même endroit
    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return;
    }

    // Trouver les colonnes source et destination
    const sourceColumn = columns.find((col) => col.id === source.droppableId);
    const destColumn = columns.find(
      (col) => col.id === destination.droppableId,
    );
    if (!sourceColumn || !destColumn) return;

    // Trouver le projet déplacé
    const project = sourceColumn.projects.find((p) => p.id === draggableId);
    if (!project) return;

    setPendingMove({
      draggableId,
      sourceId: source.droppableId,
      destinationId: destination.droppableId,
      destinationIndex: destination.index,
    });
    setMoveComment("");
    setIsCommentDialogOpen(true);
  };

  const applyPendingMove = async () => {
    if (!pendingMove) return;

    const comment = moveComment.trim();
    if (!comment) {
      toast.error("Un commentaire est obligatoire pour changer le statut");
      return;
    }

    const sourceColumn = columns.find((col) => col.id === pendingMove.sourceId);
    const destColumn = columns.find(
      (col) => col.id === pendingMove.destinationId,
    );
    if (!sourceColumn || !destColumn) {
      setPendingMove(null);
      setIsCommentDialogOpen(false);
      return;
    }

    const newColumns = [...columns];
    const sourceColIndex = newColumns.findIndex(
      (col) => col.id === pendingMove.sourceId,
    );
    const destColIndex = newColumns.findIndex(
      (col) => col.id === pendingMove.destinationId,
    );

    const project = sourceColumn.projects.find(
      (p) => p.id === pendingMove.draggableId,
    );
    if (!project) {
      setPendingMove(null);
      setIsCommentDialogOpen(false);
      return;
    }

    const newStatus = getProjectStatusFromColumnName(destColumn.title);

    if (!canEditStatus) {
      toast.error("Vous n'avez pas la permission de changer le statut");
      return;
    }

    setIsMoveSaving(true);
    try {
      await updateProject(project.id, {
        status: newStatus,
        columnId: destColumn.id,
        statusComment: comment,
      });
    } catch {
      toast.error("Erreur lors du déplacement", {
        description: `Impossible de mettre à jour le projet en base : ${project.title}`,
      });
      setIsMoveSaving(false);
      return;
    }

    // Mise à jour locale
    newColumns[sourceColIndex] = {
      ...sourceColumn,
      projects: sourceColumn.projects.filter(
        (t) => t.id !== pendingMove.draggableId,
      ),
    };
    const updatedProject = {
      ...project,
      status: newStatus,
    };
    newColumns[destColIndex] = {
      ...destColumn,
      projects: [
        ...destColumn.projects.slice(0, pendingMove.destinationIndex),
        updatedProject,
        ...destColumn.projects.slice(pendingMove.destinationIndex),
      ],
    };
    setColumns(newColumns);

    // Mettre à jour le projet sélectionné si besoin
    if (selectedProject && selectedProject.id === pendingMove.draggableId) {
      setSelectedProject(updatedProject);
    }

    toast.info("Projet déplacé", {
      description: `"${project.title}" déplacé vers ${destColumn.title}`,
    });

    setIsMoveSaving(false);
    setIsCommentDialogOpen(false);
    setPendingMove(null);
    setMoveComment("");
  };

  return (
    <div className="flex flex-col items-center mx-auto w-full">
      <div className="w-full mb-6">
        <ProjectFilters
          filters={filters}
          onFiltersChange={updateFilters}
          onShareUrl={() => {
            const url = getFilteredUrl();
            navigator.clipboard
              .writeText(url)
              .then(() => {
                toast.success("URL copiée !", {
                  description:
                    "Le lien avec les filtres a été copié dans le presse-papiers",
                });
              })
              .catch(() => {
                toast.error("Erreur", {
                  description: "Impossible de copier l'URL",
                });
              });
          }}
        />
      </div>

      <Dialog
        open={isCommentDialogOpen}
        onOpenChange={(open) => {
          setIsCommentDialogOpen(open);
          if (!open) {
            setPendingMove(null);
            setMoveComment("");
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Commentaire requis</DialogTitle>
            <DialogDescription>
              Ajoutez un commentaire pour confirmer ce changement de statut.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="board-status-comment">Commentaire</Label>
            <Textarea
              id="board-status-comment"
              value={moveComment}
              onChange={(event) => setMoveComment(event.target.value)}
              placeholder="Expliquez la raison du changement..."
              rows={4}
              className="rounded-2xl"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCommentDialogOpen(false);
                setPendingMove(null);
                setMoveComment("");
              }}
              disabled={isMoveSaving}
              className="rounded-full"
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={applyPendingMove}
              disabled={isMoveSaving}
              className="rounded-full"
            >
              {isMoveSaving ? "Enregistrement..." : "Confirmer le déplacement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className={`grid grid-cols-1 md:grid-cols-5 gap-4 h-fit mx-auto`}>
          {filteredColumns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              canCreateProject={canCreateProject}
              canMoveProject={canMoveProject}
              // onAddProject={addProject}
              onProjectClick={setSelectedProject}
              // onDeleteColumn={() => {}}
              // onUpdateColumn={() => {}}
            />
          ))}
        </div>
      </DragDropContext>

      <ProjectDetailDialog
        project={selectedProject}
        open={!!selectedProject}
        isAdmin={isAdmin}
        canEditProject={canEditProject}
        canEditStatus={canEditStatus}
        canEditDesign={canEditDesign}
        canComment={canComment}
        onOpenChange={(open) => {
          if (!open) setSelectedProject(null);
        }}
        // onProjectUpdated={handleProjectUpdate}
      />
    </div>
  );
}
