"use client";

import { KanbanColumn } from "@/components/kanban-column";
import { ProjectDetailDialog } from "@/components/projects/detail-dialog";
import { updateProject } from "@/lib/actions/kanban";
import { getRules } from "@/lib/rules";
import { getProjectStatusFromColumnName } from "@/lib/utils";
import {
  ProjectStatus,
  RuleActionType,
  RuleConditionOperator,
  RuleConditionType,
} from "@/prisma/generated/prisma";
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

    const enabledRules = rules.filter((rule) => rule.enabled);

    const projectsToMove: {
      projectId: string;
      sourceColumnId: string;
      targetColumnId: string;
    }[] = [];

    columns.forEach((column) => {
      column.projects.forEach((project) => {
        enabledRules.forEach((rule) => {
          const { condition, action } = rule;
          let conditionMet = false;

          // Check if condition is met
          if (
            condition &&
            condition.type === RuleConditionType.DUE_DATE &&
            condition.operator === RuleConditionOperator.IS_OVERDUE
          ) {
            conditionMet = Boolean(
              project.dueDate &&
                new Date(project.dueDate) < new Date() &&
                project.status !== ProjectStatus.DONE
            );
          } else if (
            condition &&
            condition.type === RuleConditionType.TASKS_COMPLETED &&
            condition.operator === RuleConditionOperator.ALL_COMPLETED
          ) {
            conditionMet =
              project.tasks.length > 0 &&
              project.tasks.every((subtask) => subtask.completed);
          } else if (
            condition &&
            condition.type === RuleConditionType.CUSTOM_FIELD &&
            condition.field
          ) {
            const field = project.customFields.find(
              (f) => f.name === condition.field
            );
            if (field) {
              if (condition.operator === RuleConditionOperator.EQUALS) {
                conditionMet = field.value === condition.value;
              } else if (
                condition.operator === RuleConditionOperator.NOT_EQUALS
              ) {
                conditionMet = field.value !== condition.value;
              } else if (
                condition.operator === RuleConditionOperator.CONTAINS
              ) {
                conditionMet = field.value.includes(condition.value || "");
              }
            }
          }

          // If condition is met and task is not already in the target column
          if (
            conditionMet &&
            action &&
            action.type === RuleActionType.MOVE_TO_COLUMN
          ) {
            const targetColumn = columns.find(
              (col) => col.id === action.targetColumnId
            );
            if (targetColumn && project.status !== targetColumn.title) {
              projectsToMove.push({
                projectId: project.id,
                sourceColumnId: column.id,
                targetColumnId: action.targetColumnId,
              });
            }
          }
        });
      });
    });

    if (projectsToMove.length > 0) {
      const newColumns = [...columns];

      projectsToMove.forEach(
        ({ projectId: projectId, sourceColumnId, targetColumnId }) => {
          const sourceColIndex = newColumns.findIndex(
            (col) => col.id === sourceColumnId
          );
          const targetColIndex = newColumns.findIndex(
            (col) => col.id === targetColumnId
          );

          if (sourceColIndex !== -1 && targetColIndex !== -1) {
            const sourceCol = newColumns[sourceColIndex];
            const projectIndex = sourceCol.projects.findIndex(
              (t) => t.id === projectId
            );

            if (projectIndex !== -1) {
              const project = {
                ...sourceCol.projects[projectIndex],
                status: getProjectStatusFromColumnName(
                  newColumns[targetColIndex].title
                ) as ProjectStatus,
              };

              // Remove from source
              newColumns[sourceColIndex] = {
                ...sourceCol,
                projects: sourceCol.projects.filter((p) => p.id !== projectId),
              };

              // Add to target
              newColumns[targetColIndex] = {
                ...newColumns[targetColIndex],
                projects: [...newColumns[targetColIndex].projects, project],
              };

              // Note: We don't update selectedProject here to avoid infinite loop
              // The selectedProject will be updated when user selects it again
            }
          }
        }
      );

      setColumns(newColumns);
    }
  }, [selectedProject]);

  const rules = getRules(columns);

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
      />
    </div>
  );
}
