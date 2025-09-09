/*
  Warnings:

  - The values [SUBTASKS_COMPLETED] on the enum `RuleConditionType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."RuleConditionType_new" AS ENUM ('DUE_DATE', 'TASKS_COMPLETED', 'CUSTOM_FIELD');
ALTER TABLE "public"."rule_condition" ALTER COLUMN "type" TYPE "public"."RuleConditionType_new" USING ("type"::text::"public"."RuleConditionType_new");
ALTER TYPE "public"."RuleConditionType" RENAME TO "RuleConditionType_old";
ALTER TYPE "public"."RuleConditionType_new" RENAME TO "RuleConditionType";
DROP TYPE "public"."RuleConditionType_old";
COMMIT;
