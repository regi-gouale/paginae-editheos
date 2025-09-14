"use client";

import { KanbanColumn } from "@/components/kanban-column";
import { ProjectDetailDialog } from "@/components/projects/detail-dialog";
import { updateProject } from "@/lib/actions/kanban";
import { getRules, shouldMoveProject } from "@/lib/rules";
import {
  getColumnNameFromProjectStatus,
  getProjectStatusFromColumnName,
} from "@/lib/utils";
import { ProjectStatus } from "@/prisma/generated/prisma";
import { KanbanColumnWithProjects, ProjectWithDetails } from "@/types/kanban";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ProjectsBoardProps {
  initialColumns: KanbanColumnWithProjects[];
}

export function ProjectsBoard({ initialColumns }: ProjectsBoardProps) {
  const [columns, setColumns] =
    useState<KanbanColumnWithProjects[]>(initialColumns);
  const [selectedProject, setSelectedProject] =
    useState<ProjectWithDetails | null>(null);

  // Define some example rules
  // In a real application, these would likely come from props or context

  useEffect(() => {
    if (initialColumns.length === 0) return;
    setColumns(initialColumns);
  }, [initialColumns]);

  useEffect(() => {
    if (columns.length === 0) return;

    let hasInconsistencies = false;
    const fixPromises: Promise<any>[] = [];

    columns.forEach((column) => {
      column.projects.forEach((project) => {
        const expectedStatus = getProjectStatusFromColumnName(column.title);
        if (project.status !== expectedStatus) {
          hasInconsistencies = true;

          // Créer une promesse de correction pour ce projet
          const fixPromise = updateProject(project.id, {
            status: expectedStatus,
          })
            .then(() => {
              toast.success("Incohérence corrigée", {
                description: `Le statut du projet "${project.title}" a été synchronisé avec la colonne "${column.title}".`,
              });
            })
            .catch((error) => {
              toast.error("Erreur lors de la correction", {
                description: `Impossible de corriger le statut du projet "${project.title}" : ${error.message}`,
              });
            });

          fixPromises.push(fixPromise);
        }
      });
    });

    // Afficher un message global si des incohérences sont détectées
    if (hasInconsistencies && fixPromises.length > 0) {
      toast.warning("Incohérences détectées", {
        description: `${fixPromises.length} projet(s) avec des statuts incohérents sont en cours de correction...`,
      });

      // Attendre que toutes les corrections soient terminées
      Promise.all(fixPromises).then(() => {
        // Forcer un rafraîchissement de la page pour voir les changements
        window.location.reload();
      });
    }
  }, [columns]);

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
              (col) => col.id === rule.action!.targetColumnId
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
      const newColumns = [...columns];

      projectsToMove.forEach(
        ({ projectId, sourceColumnId, targetColumnId }) => {
          const sourceColIndex = newColumns.findIndex(
            (col) => col.id === sourceColumnId
          );
          const targetColIndex = newColumns.findIndex(
            (col) => col.id === targetColumnId
          );

          if (sourceColIndex !== -1 && targetColIndex !== -1) {
            const sourceCol = newColumns[sourceColIndex];
            const projectIndex = sourceCol.projects.findIndex(
              (p) => p.id === projectId
            );

            if (projectIndex !== -1) {
              const project = {
                ...sourceCol.projects[projectIndex],
                status: getProjectStatusFromColumnName(
                  newColumns[targetColIndex].title
                ) as ProjectStatus,
              };

              // Retirer de la colonne source
              newColumns[sourceColIndex] = {
                ...sourceCol,
                projects: sourceCol.projects.filter((p) => p.id !== projectId),
              };

              // Ajouter à la colonne cible
              newColumns[targetColIndex] = {
                ...newColumns[targetColIndex],
                projects: [...newColumns[targetColIndex].projects, project],
              };

              // Afficher une notification
              toast.info("Règle d'automatisation appliquée", {
                description: `"${project.title}" déplacé automatiquement vers ${newColumns[targetColIndex].title}`,
              });
            }
          }
        }
      );

      setColumns(newColumns);
    }
  }, [columns]);

  const handleProjectUpdate = (updatedProject: ProjectWithDetails) => {
    const newColumns = [...columns];

    // Trouver l'ancienne colonne du projet
    let sourceColumnIndex = -1;
    let projectIndex = -1;

    for (let i = 0; i < newColumns.length; i++) {
      projectIndex = newColumns[i].projects.findIndex(
        (p) => p.id === updatedProject.id
      );
      if (projectIndex !== -1) {
        sourceColumnIndex = i;
        break;
      }
    }

    if (sourceColumnIndex === -1) return;

    // Trouver la nouvelle colonne basée sur le statut
    const targetColumnTitle = getColumnNameFromProjectStatus(
      updatedProject.status
    );
    const targetColumnIndex = newColumns.findIndex(
      (col) => col.title === targetColumnTitle
    );

    if (targetColumnIndex === -1) return;

    // Si le projet est déjà dans la bonne colonne, juste mettre à jour ses données
    if (sourceColumnIndex === targetColumnIndex) {
      newColumns[sourceColumnIndex].projects[projectIndex] = updatedProject;
    } else {
      // Retirer le projet de l'ancienne colonne
      newColumns[sourceColumnIndex] = {
        ...newColumns[sourceColumnIndex],
        projects: newColumns[sourceColumnIndex].projects.filter(
          (p) => p.id !== updatedProject.id
        ),
      };

      // Ajouter le projet à la nouvelle colonne
      newColumns[targetColumnIndex] = {
        ...newColumns[targetColumnIndex],
        projects: [...newColumns[targetColumnIndex].projects, updatedProject],
      };
    }

    setColumns(newColumns);

    // Mettre à jour le projet sélectionné
    if (selectedProject && selectedProject.id === updatedProject.id) {
      setSelectedProject(updatedProject);
    }
  };

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
      (col) => col.id === destination.droppableId
    );
    if (!sourceColumn || !destColumn) return;

    // Créer les nouveaux tableaux de colonnes
    const newColumns = [...columns];
    const sourceColIndex = newColumns.findIndex(
      (col) => col.id === source.droppableId
    );
    const destColIndex = newColumns.findIndex(
      (col) => col.id === destination.droppableId
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
    } catch (error) {
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
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className={`grid grid-cols-1 md:grid-cols-5 gap-4 h-fit mx-auto`}>
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              // onAddProject={addProject}
              onProjectClick={setSelectedProject}
              onDeleteColumn={() => {}}
              onUpdateColumn={() => {}}
            />
          ))}
        </div>
      </DragDropContext>

      <ProjectDetailDialog
        project={selectedProject}
        open={!!selectedProject}
        onOpenChange={(open) => {
          if (!open) setSelectedProject(null);
        }}
        onProjectUpdated={handleProjectUpdate}
      />
    </div>
  );
}
