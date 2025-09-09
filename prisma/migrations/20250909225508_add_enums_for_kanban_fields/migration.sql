/*
  Warnings:

  - The `status` column on the `project` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `type` on the `rule_action` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `rule_condition` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `operator` on the `rule_condition` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."ProjectStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."RuleConditionType" AS ENUM ('DUE_DATE', 'SUBTASKS_COMPLETED', 'CUSTOM_FIELD');

-- CreateEnum
CREATE TYPE "public"."RuleConditionOperator" AS ENUM ('EQUALS', 'NOT_EQUALS', 'CONTAINS', 'GREATER_THAN', 'LESS_THAN', 'IS_EMPTY', 'IS_NOT_EMPTY', 'IS_OVERDUE', 'ALL_COMPLETED');

-- CreateEnum
CREATE TYPE "public"."RuleActionType" AS ENUM ('MOVE_TO_COLUMN');

-- AlterTable
ALTER TABLE "public"."project" DROP COLUMN "status",
ADD COLUMN     "status" "public"."ProjectStatus" NOT NULL DEFAULT 'TODO';

-- AlterTable
ALTER TABLE "public"."rule_action" DROP COLUMN "type",
ADD COLUMN     "type" "public"."RuleActionType" NOT NULL;

-- AlterTable
ALTER TABLE "public"."rule_condition" DROP COLUMN "type",
ADD COLUMN     "type" "public"."RuleConditionType" NOT NULL,
DROP COLUMN "operator",
ADD COLUMN     "operator" "public"."RuleConditionOperator" NOT NULL;
