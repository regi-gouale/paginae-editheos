import type {
  Author,
  CustomField,
  KanbanColumn,
  Member,
  Project,
  ProjectComment,
  ProjectTask,
} from "@/prisma/generated/prisma/client";

// Extended types based on Prisma schema
export interface ProjectWithDetails extends Project {
  authors: Author[];
  members: Member[];
  tasks: ProjectTask[];
  customFields: CustomField[];
  comments?: ProjectComment[];
  kanbanColumn?: KanbanColumn | null;
}

export interface KanbanColumnWithProjects extends KanbanColumn {
  projects: ProjectWithDetails[];
}

// Rule interfaces (matching Prisma enums)
type RuleConditionType = "DUE_DATE" | "TASKS_COMPLETED" | "CUSTOM_FIELD";
type RuleConditionOperator =
  | "EQUALS"
  | "NOT_EQUALS"
  | "CONTAINS"
  | "GREATER_THAN"
  | "LESS_THAN"
  | "IS_EMPTY"
  | "IS_NOT_EMPTY"
  | "IS_OVERDUE"
  | "ALL_COMPLETED"
  | "ANY_COMPLETED";

type RuleActionType = "MOVE_TO_COLUMN";

export interface KanbanRule {
  id: string;
  name: string;
  enabled: boolean;
  condition: {
    type: RuleConditionType;
    field?: string | null;
    operator: RuleConditionOperator;
    value?: string | null;
  } | null;
  action: {
    type: RuleActionType;
    targetColumnId: string;
  } | null;
}
