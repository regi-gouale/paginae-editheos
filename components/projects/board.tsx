"use client";

import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ProjectDetailDialog } from "@/components/projects/detail-dialog";
import { KanbanColumn } from "@/components/projects/kanban-column";
import { ProjectFilters } from "@/components/projects/project-filters";
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
}

export function ProjectsBoard({ initialColumns, isAdmin }: ProjectsBoardProps) {
  const [columns, setColumns] =
    useState<KanbanColumnWithProjects[]>(initialColumns);
  const [selectedProject, setSelectedProject] =
    useState<ProjectWithDetails | null>(null);

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
              (col) => col.id === rule.action!.targetColumnId,
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

  // const handleProjectUpdate = (updatedProject: ProjectWithDetails) => {
  //   const newColumns = [...columns];

  //   // Trouver l'ancienne colonne du projet
  //   let sourceColumnIndex = -1;
  //   let projectIndex = -1;

  //   for (let i = 0; i < newColumns.length; i++) {
  //     projectIndex = newColumns[i].projects.findIndex(
  //       (p) => p.id === updatedProject.id
  //     );
  //     if (projectIndex !== -1) {
  //       sourceColumnIndex = i;
  //       break;
  //     }
  //   }

  //   if (sourceColumnIndex === -1) return;

  //   // Trouver la nouvelle colonne basée sur le statut
  //   const targetColumnTitle = getColumnNameFromProjectStatus(
  //     updatedProject.status
  //   );
  //   const targetColumnIndex = newColumns.findIndex(
  //     (col) => col.title === targetColumnTitle
  //   );

  //   if (targetColumnIndex === -1) return;

  //   // Si le projet est déjà dans la bonne colonne, juste mettre à jour ses données
  //   if (sourceColumnIndex === targetColumnIndex) {
  //     newColumns[sourceColumnIndex].projects[projectIndex] = updatedProject;
  //   } else {
  //     // Retirer le projet de l'ancienne colonne
  //     newColumns[sourceColumnIndex] = {
  //       ...newColumns[sourceColumnIndex],
  //       projects: newColumns[sourceColumnIndex].projects.filter(
  //         (p) => p.id !== updatedProject.id
  //       ),
  //     };

  //     // Ajouter le projet à la nouvelle colonne
  //     newColumns[targetColumnIndex] = {
  //       ...newColumns[targetColumnIndex],
  //       projects: [...newColumns[targetColumnIndex].projects, updatedProject],
  //     };
  //   }

  //   setColumns(newColumns);

  //   // Mettre à jour le projet sélectionné
  //   if (selectedProject && selectedProject.id === updatedProject.id) {
  //     setSelectedProject(updatedProject);
  //   }
  // };

  const handleDragEnd = async (result: DropResult) => {
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

    // Créer les nouveaux tableaux de colonnes
    const newColumns = [...columns];
    const sourceColIndex = newColumns.findIndex(
      (col) => col.id === source.droppableId,
    );
    const destColIndex = newColumns.findIndex(
      (col) => col.id === destination.droppableId,
    );

    // Trouver le projet déplacé
    const project = sourceColumn.projects.find((p) => p.id === draggableId);
    if (!project) return;

    // Déterminer le nouveau statut
    const newStatus = getProjectStatusFromColumnName(destColumn.title);

    // Appel de l'action server pour mettre à jour le statut en base
    try {
      await updateProject(project.id, {
        status: newStatus,
        columnId: destColumn.id,
      });
    } catch {
      toast.error("Erreur lors du déplacement", {
        description: `Impossible de mettre à jour le projet en base : ${project.title}`,
      });
      return;
    }
    // Mise à jour locale
    newColumns[sourceColIndex] = {
      ...sourceColumn,
      projects: sourceColumn.projects.filter((t) => t.id !== draggableId),
    };
    const updatedProject = {
      ...project,
      status: newStatus,
    };
    newColumns[destColIndex] = {
      ...destColumn,
      projects: [
        ...destColumn.projects.slice(0, destination.index),
        updatedProject,
        ...destColumn.projects.slice(destination.index),
      ],
    };
    setColumns(newColumns);

    // Mettre à jour le projet sélectionné si besoin
    if (selectedProject && selectedProject.id === draggableId) {
      setSelectedProject(updatedProject);
    }

    toast.info("Projet déplacé", {
      description: `"${project.title}" déplacé vers ${destColumn.title}`,
    });
  };

  return (
    <div className="flex flex-col items-center mx-auto">
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

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className={`grid grid-cols-1 md:grid-cols-5 gap-4 h-fit mx-auto`}>
          {filteredColumns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
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
        onOpenChange={(open) => {
          if (!open) setSelectedProject(null);
        }}
        // onProjectUpdated={handleProjectUpdate}
      />
    </div>
  );
}
