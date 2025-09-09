/*
  Warnings:

  - You are about to drop the column `name` on the `kanban_column` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `project` table. All the data in the column will be lost.
  - You are about to drop the column `priority` on the `project` table. All the data in the column will be lost.
  - You are about to drop the column `actionId` on the `rule` table. All the data in the column will be lost.
  - You are about to drop the column `conditionId` on the `rule` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `rule` table. All the data in the column will be lost.
  - You are about to drop the `RuleAction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RuleCondion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `task` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `projectId` to the `custom_field` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `kanban_column` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."rule" DROP CONSTRAINT "rule_actionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."rule" DROP CONSTRAINT "rule_conditionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."task" DROP CONSTRAINT "task_kanbanColumnId_fkey";

-- DropForeignKey
ALTER TABLE "public"."task" DROP CONSTRAINT "task_projectId_fkey";

-- AlterTable
ALTER TABLE "public"."custom_field" ADD COLUMN     "projectId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."kanban_column" DROP COLUMN "name",
ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."project" DROP COLUMN "endDate",
DROP COLUMN "priority",
ADD COLUMN     "columnId" TEXT,
ADD COLUMN     "dueDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."rule" DROP COLUMN "actionId",
DROP COLUMN "conditionId",
DROP COLUMN "isActive",
ADD COLUMN     "enabled" BOOLEAN NOT NULL DEFAULT true;

-- DropTable
DROP TABLE "public"."RuleAction";

-- DropTable
DROP TABLE "public"."RuleCondion";

-- DropTable
DROP TABLE "public"."task";

-- DropEnum
DROP TYPE "public"."RuleActionType";

-- DropEnum
DROP TYPE "public"."RuleConditionOperator";

-- DropEnum
DROP TYPE "public"."RuleConditionType";

-- CreateTable
CREATE TABLE "public"."project_task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "project_task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rule_condition" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "field" TEXT,
    "operator" TEXT NOT NULL,
    "value" TEXT,
    "ruleId" TEXT NOT NULL,

    CONSTRAINT "rule_condition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rule_action" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "targetColumnId" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,

    CONSTRAINT "rule_action_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rule_condition_ruleId_key" ON "public"."rule_condition"("ruleId");

-- CreateIndex
CREATE UNIQUE INDEX "rule_action_ruleId_key" ON "public"."rule_action"("ruleId");

-- AddForeignKey
ALTER TABLE "public"."project" ADD CONSTRAINT "project_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "public"."kanban_column"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project_task" ADD CONSTRAINT "project_task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."custom_field" ADD CONSTRAINT "custom_field_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rule_condition" ADD CONSTRAINT "rule_condition_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "public"."rule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rule_action" ADD CONSTRAINT "rule_action_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "public"."rule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
