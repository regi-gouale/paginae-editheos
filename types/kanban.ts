import {
  Author,
  CustomField,
  KanbanColumn,
  Member,
  Project,
  ProjectStatus,
  ProjectTask,
} from "@/prisma/generated/prisma";

// Extended types based on Prisma schema
export interface ProjectWithDetails extends Project {
  authors: Author[];
  members: Member[];
  tasks: ProjectTask[];
  customFields: CustomField[];
  kanbanColumn?: KanbanColumn | null;
}

export interface KanbanColumnWithProjects extends KanbanColumn {
  projects: ProjectWithDetails[];
}

// Task interface for Kanban (using ProjectTask as base but extending for UI needs)
export interface KanbanTask {
  id: string;
  title: string;
  description?: string | null;
  status: ProjectStatus;
  dueDate: Date | null;
  completed: boolean;
  projectId: string;
  project?: ProjectWithDetails;
  createdAt: Date;
  updatedAt: Date;
}

// Column interface for Kanban
export interface KanbanBoardColumn {
  id: string;
  title: string;
  color?: string | null;
  position: number;
  projects: ProjectWithDetails[];
}

// Rule interfaces (matching Prisma enums)
export type RuleConditionType = "DUE_DATE" | "TASKS_COMPLETED" | "CUSTOM_FIELD";
export type RuleConditionOperator =
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

export type RuleActionType = "MOVE_TO_COLUMN";

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

// Utility types for drag and drop
export interface DragResult {
  draggableId: string;
  type: string;
  source: {
    droppableId: string;
    index: number;
  };
  destination: {
    droppableId: string;
    index: number;
  } | null;
}

// Form types for creating/editing
export interface CreateProjectData {
  title: string;
  description?: string;
  status?: ProjectStatus;
  dueDate?: Date;
  authorIds?: string[];
  memberIds?: string[];
  columnId?: string;
}

export interface CreateColumnData {
  title: string;
  color?: string;
  position: number;
}

export interface CreateTaskData {
  title: string;
  projectId: string;
  completed?: boolean;
}
