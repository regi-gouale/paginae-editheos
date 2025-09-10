"use client";

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
import { KanbanColumn } from "./kanban-column";

interface Task {
  id: string;

  title: string;

  description?: string;
}

interface KanbanBoardProps {
  initialColumns: KanbanColumnWithProjects[];
}

export function KanbanBoard({ initialColumns }: KanbanBoardProps) {
  const { toast } = useToast();
  const [columns, setColumns] =
    useState<KanbanColumnWithProjects[]>(initialColumns);
  const [selectedProject, setSelectedProject] =
    useState<ProjectWithDetails | null>(null);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [rules, setRules] = useState<KanbanRule[]>([]);
  const [activeTab, setActiveTab] = useState<"board" | "rules">("board");

  useEffect(() => {
    setColumns(initialColumns);

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

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If there's no destination or the item is dropped in the same place
    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return;
    }

    // Find the source and destination columns
    const sourceColumn = columns.find((col) => col.id === source.droppableId);
    const destColumn = columns.find(
      (col) => col.id === destination.droppableId
    );

    if (!sourceColumn || !destColumn) return;

    // Create new arrays for the columns
    const newColumns = [...columns];
    const sourceColIndex = newColumns.findIndex(
      (col) => col.id === source.droppableId
    );
    const destColIndex = newColumns.findIndex(
      (col) => col.id === destination.droppableId
    );

    // Find the task being moved
    const task = sourceColumn.projects.find((t) => t.id === draggableId);
    if (!task) return;

    // Remove the task from the source column
    newColumns[sourceColIndex] = {
      ...sourceColumn,
      projects: sourceColumn.projects.filter((t) => t.id !== draggableId),
    };

    // Add the task to the destination column with updated status
    const updatedProject = {
      ...task,
      status: destColumn.title as ProjectStatus,
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

    // Update selected project if it's the one being moved
    if (selectedProject && selectedProject.id === draggableId) {
      setSelectedProject(updatedProject);
    }

    toast({
      title: "Task moved",
      description: `"${task.title}" moved to ${destColumn.title}`,
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

  const updateProject = (updatedProject: ProjectWithDetails) => {
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

  const deleteProject = (projectId: string) => {
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

  const duplicateProject = (project: ProjectWithDetails, columnId?: string) => {
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
              onDuplicateProject={duplicateProject}
            />
          ))}

          {/* <div className="shrink-0 w-fit flex flex-col rounded-lg max-w-92">
            {isAddingColumn ? (
              <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm border dark:border-gray-700">
                <Label htmlFor="column-title" className="dark:text-gray-200">
                  Titre de la colonne
                </Label>
                <Input
                  id="column-title"
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  placeholder="Titre de la colonne"
                  className="mb-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => {}}>
                    Ajouter
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsAddingColumn(false)}
                    className="dark:border-gray-600 dark:text-gray-200"
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                className="border-dashed border-2 w-fit h-12 dark:border-gray-700 dark:text-gray-300 max-w-92"
                onClick={() => setIsAddingColumn(true)}
              >
                <Plus className="mr-2 size-4" /> Ajouter une colonne
              </Button>
            )}
          </div> */}
        </div>
      </DragDropContext>
    </div>
  );
}
