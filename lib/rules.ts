import { generateRandomId } from "@/lib/utils";
import type {
  KanbanColumnWithProjects,
  KanbanRule,
  ProjectWithDetails,
} from "@/types/kanban";

export const getRules = (columns: KanbanColumnWithProjects[]): KanbanRule[] => {
  // Trouver les colonnes par titre pour plus de robustesse
  const blockedColumn = columns.find((col) => col.title === "Bloqué");
  const doneColumn = columns.find((col) => col.title === "Terminé");
  const inProgressColumn = columns.find((col) => col.title === "En cours");

  if (!blockedColumn || !doneColumn || !inProgressColumn) {
    console.warn(
      "Colonnes 'Bloqué', 'Terminé' ou 'En cours' introuvables pour les règles d'automatisation",
    );
    return [];
  }

  return [
    {
      id: `rule-task-completed-move-to-progress-${generateRandomId()}`,
      name: "Déplacer vers En cours quand une tâche est complétée (depuis À faire)",
      enabled: true,
      condition: {
        type: "TASKS_COMPLETED",
        operator: "ANY_COMPLETED",
      },
      action: {
        type: "MOVE_TO_COLUMN",
        targetColumnId: inProgressColumn.id,
      },
    },
    {
      id: `rule-tasks-completed-${generateRandomId()}`,
      name: "Déplacer vers Terminé quand toutes les tâches sont complétées",
      enabled: true,
      condition: {
        type: "TASKS_COMPLETED",
        operator: "ALL_COMPLETED",
      },
      action: {
        type: "MOVE_TO_COLUMN",
        targetColumnId: doneColumn.id,
      },
    },
    {
      id: `rule-overdue-blocked-${generateRandomId()}`,
      name: "Déplacer vers Bloqué les projets en retard (non terminés)",
      enabled: true,
      condition: {
        type: "DUE_DATE",
        operator: "IS_OVERDUE",
      },
      action: {
        type: "MOVE_TO_COLUMN",
        targetColumnId: blockedColumn.id,
      },
    },
  ];
};

/**
 * Vérifie si un projet doit être déplacé selon les règles d'automatisation
 */
export const shouldMoveProject = (
  project: ProjectWithDetails,
  rule: KanbanRule,
): boolean => {
  if (!rule.enabled || !rule.condition) return false;

  const { condition } = rule;

  switch (condition.type) {
    case "TASKS_COMPLETED":
      if (condition.operator === "ANY_COMPLETED") {
        // Vérifie si le projet a des tâches ET si au moins une est complétée
        // ET si le projet est actuellement en statut TODO
        return (
          project.tasks.length > 0 &&
          project.tasks.some((task) => task.completed) &&
          project.status === "TODO"
        );
      }
      if (condition.operator === "ALL_COMPLETED") {
        // Vérifie si le projet a des tâches ET si toutes sont complétées
        return (
          project.tasks.length > 0 &&
          project.tasks.every((task) => task.completed) &&
          project.status !== "DONE"
        );
      }
      break;

    case "DUE_DATE":
      if (condition.operator === "IS_OVERDUE") {
        // Vérifie si le projet est en retard ET n'est pas terminé
        return Boolean(
          project.dueDate &&
          project.status !== "DONE" &&
          new Date(project.dueDate) < new Date(),
        );
      }
      break;
  }

  return false;
};

/**
 * Vérifie si un projet terminé doit être exempt de l'affichage "en retard"
 */
export const isExemptFromOverdueDisplay = (
  project: ProjectWithDetails,
): boolean => {
  return project.status === "DONE";
};
