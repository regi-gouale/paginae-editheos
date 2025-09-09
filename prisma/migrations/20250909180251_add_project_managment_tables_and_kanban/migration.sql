-- CreateEnum
CREATE TYPE "public"."RuleConditionType" AS ENUM ('DUE_DATE', 'TASK_COMPLETED', 'CUSTOM_FIELD');

-- CreateEnum
CREATE TYPE "public"."RuleConditionOperator" AS ENUM ('EQUALS', 'NOT_EQUALS', 'CONTAINS', 'GREATER_THAN', 'LESS_THAN', 'IS_EMPTY', 'IS_NOT_EMPTY', 'IS_OVERDUE', 'ALL_COMPLETED');

-- CreateEnum
CREATE TYPE "public"."RuleActionType" AS ENUM ('SEND_NOTIFICATION', 'ASSIGN_MEMBER', 'MOVE_TASK', 'UPDATE_FIELD', 'MOVE_TO_COLUMN');

-- CreateTable
CREATE TABLE "public"."project" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL,
    "endDate" TIMESTAMP(3),
    "priority" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3),
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "projectId" TEXT NOT NULL,
    "kanbanColumnId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."custom_field" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "custom_field_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."kanban_column" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kanban_column_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "conditionId" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RuleCondion" (
    "id" TEXT NOT NULL,
    "type" "public"."RuleConditionType" NOT NULL,
    "field" TEXT,
    "operator" "public"."RuleConditionOperator" NOT NULL,
    "value" TEXT,

    CONSTRAINT "RuleCondion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RuleAction" (
    "id" TEXT NOT NULL,
    "type" "public"."RuleActionType" NOT NULL,
    "targetColumnId" TEXT NOT NULL,

    CONSTRAINT "RuleAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_ProjectMembers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProjectMembers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_ProjectAuthors" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProjectAuthors_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ProjectMembers_B_index" ON "public"."_ProjectMembers"("B");

-- CreateIndex
CREATE INDEX "_ProjectAuthors_B_index" ON "public"."_ProjectAuthors"("B");

-- AddForeignKey
ALTER TABLE "public"."task" ADD CONSTRAINT "task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task" ADD CONSTRAINT "task_kanbanColumnId_fkey" FOREIGN KEY ("kanbanColumnId") REFERENCES "public"."kanban_column"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rule" ADD CONSTRAINT "rule_conditionId_fkey" FOREIGN KEY ("conditionId") REFERENCES "public"."RuleCondion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rule" ADD CONSTRAINT "rule_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "public"."RuleAction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ProjectMembers" ADD CONSTRAINT "_ProjectMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ProjectMembers" ADD CONSTRAINT "_ProjectMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ProjectAuthors" ADD CONSTRAINT "_ProjectAuthors_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."author"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ProjectAuthors" ADD CONSTRAINT "_ProjectAuthors_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
