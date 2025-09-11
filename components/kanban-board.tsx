"use client";

import { updateProject } from "@/app/actions/kanban";
import { KanbanColumn } from "@/components/kanban-column";
import { useToast } from "@/hooks/use-toast";
import {
  ProjectStatus,
  RuleActionType,
  RuleConditionOperator,
  RuleConditionType,
} from "@/prisma/generated/prisma";
import {
  KanbanColumnWithProjects,
  KanbanRule,
  ProjectWithDetails,
} from "@/types/kanban";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { randomUUID } from "crypto";
import { useEffect, useState } from "react";
import { ProjectDetailSidebar } from "./project-detail-sidebar";

interface KanbanBoardProps {
  initialColumns: KanbanColumnWithProjects[];
}

export function KanbanBoard({ initialColumns }: KanbanBoardProps) {
  const { toast } = useToast();
  const [columns, setColumns] =
    useState<KanbanColumnWithProjects[]>(initialColumns);
  const [selectedProject, setSelectedProject] =
    useState<ProjectWithDetails | null>(null);
  const [rules, setRules] = useState<KanbanRule[]>([]);

  useEffect(() => {
    setColumns(initialColumns);

    if (initialColumns.length >= 5) {
      setRules([
        {
          id: `rule-${randomUUID}`,
          name: "Déplacer les projets en retard à Bloqué",
          enabled: true,
          condition: {
            type: RuleConditionType.DUE_DATE,
            operator: RuleConditionOperator.IS_OVERDUE,
          },
          action: {
            type: RuleActionType.MOVE_TO_COLUMN,
            targetColumnId: columns[2].id,
          },
        },
        {
          id: `rule-${randomUUID}`,
          name: "Move completed projects when all tasks are done",
          enabled: true,
          condition: {
            type: RuleConditionType.TASKS_COMPLETED,
            operator: RuleConditionOperator.ALL_COMPLETED,
          },
          action: {
            type: RuleActionType.MOVE_TO_COLUMN,
            targetColumnId: columns[3].id,
          },
        },
      ]);
    }
  }, []);

  // Process automation rules
  useEffect(() => {
    if (rules.length === 0) return;

    // Only process enabled rules
    const enabledRules = rules.filter((rule) => rule.enabled);
    if (enabledRules.length === 0) return;

    const projectsToMove: {
      projectId: string;
      sourceColumnId: string;
      targetColumnId: string;
    }[] = [];

    // Check each project against each rule
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

    // Apply the moves
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
                status: newColumns[targetColIndex].title as ProjectStatus,
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

              // Update selected project if it's being moved
              if (selectedProject && selectedProject.id === projectId) {
                setSelectedProject(project);
              }

              toast({
                title: "Project moved automatically",
                description: `"${project.title}" moved to ${
                  newColumns[targetColIndex].title
                } by rule: ${
                  rules.find(
                    (r) =>
                      r.action && r.action.targetColumnId === targetColumnId
                  )?.name
                }`,
              });
            }
          }
        }
      );

      setColumns(newColumns);
    }
  }, [columns, rules, selectedProject, toast]);

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
    const getNewProjectStatus = (columnTitle: string): ProjectStatus => {
      switch (columnTitle) {
        case "À faire":
          return ProjectStatus.TODO;
        case "En cours":
          return ProjectStatus.IN_PROGRESS;
        case "Bloqué":
          return ProjectStatus.BLOCKED;
        case "Terminé":
          return ProjectStatus.DONE;
        case "Rejeté":
          return ProjectStatus.REJECTED;
        default:
          return ProjectStatus.TODO;
      }
    };
    const newStatus = getNewProjectStatus(destColumn.title);

    // Appel de l'action server pour mettre à jour le statut en base
    try {
      await updateProject(project.id, {
        status: newStatus,
        columnId: destColumn.id,
      });
    } catch (error) {
      toast({
        title: "Erreur lors du déplacement",
        description: `Impossible de mettre à jour le projet en base : ${project.title}`,
        variant: "destructive",
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

    toast({
      title: "Projet déplacé",
      description: `"${project.title}" déplacé vers ${destColumn.title}`,
    });
  };

  const addProject = (columnId: string, project: ProjectWithDetails) => {
    const newColumns = columns.map((column) => {
      if (column.id === columnId) {
        return {
          ...column,
          projects: [...column.projects, project],
        };
      }
      return column;
    });
    setColumns(newColumns);
    toast({
      title: "Project created",
      description: `"${project.title}" added to ${
        columns.find((col) => col.id === columnId)?.title
      }`,
    });
  };

  const updateProjectLocal = (updatedProject: ProjectWithDetails) => {
    const newColumns = columns.map((column) => {
      return {
        ...column,
        projects: column.projects.map((project) =>
          project.id === updatedProject.id ? updatedProject : project
        ),
      };
    });
    setColumns(newColumns);
    setSelectedProject(updatedProject);
    toast({
      title: "Project updated",
      description: `"${updatedProject.title}" has been updated`,
    });
  };

  const deleteProjectLocal = (projectId: string) => {
    const newColumns = columns.map((column) => {
      return {
        ...column,
        projects: column.projects.filter((project) => project.id !== projectId),
      };
    });
    setColumns(newColumns);
    setSelectedProject(null);
    toast({
      title: "Project deleted",
      description: "The project has been deleted",
    });
  };

  const duplicateProjectLocal = (
    project: ProjectWithDetails,
    columnId?: string
  ) => {
    // Create a deep copy of the project with a new ID
    const duplicatedProject: ProjectWithDetails = {
      ...JSON.parse(JSON.stringify(project)),
      id: `project-${randomUUID()}`,
      title: `${project.title} (Copy)`,
      createdAt: new Date().toISOString(),
    };

    // If columnId is provided, add to that column, otherwise add to the same column as the original
    const targetColumnId =
      columnId ||
      columns.find((col) => col.projects.some((p) => p.id === project.id))?.id;

    if (targetColumnId) {
      addProject(targetColumnId, duplicatedProject);
      toast({
        title: "Project duplicated",
        description: `"${duplicatedProject.title}" created`,
      });
    }
  };

  return (
    <div className="flex flex-col items-center mx-auto">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className={`grid grid-cols-1 md:grid-cols-5 gap-4 h-fit mx-auto`}>
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              onAddProject={addProject}
              onProjectClick={setSelectedProject}
              onDeleteColumn={() => {}}
              onUpdateColumn={() => {}}
              onDuplicateProject={duplicateProjectLocal}
            />
          ))}
        </div>
      </DragDropContext>
      {selectedProject && (
        <ProjectDetailSidebar
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onUpdate={updateProjectLocal}
          onDelete={deleteProjectLocal}
          onDuplicate={duplicateProjectLocal}
          columns={columns}
        />
      )}
    </div>
  );
}
