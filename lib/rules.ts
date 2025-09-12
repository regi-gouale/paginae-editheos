import { generateRandomId } from "@/lib/utils";
import {
  RuleActionType,
  RuleConditionOperator,
  RuleConditionType,
} from "@/prisma/generated/prisma";
import { KanbanColumnWithProjects, KanbanRule } from "@/types/kanban";

export const getRules = (columns: KanbanColumnWithProjects[]): KanbanRule[] => {
  return [
    {
      id: `rule-${generateRandomId()}`,
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
      id: `rule-${generateRandomId()}`,
      name: "Déplacer les projets terminés à la colonne 'Terminé'",
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
  ];
};
