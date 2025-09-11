/*
  Warnings:

  - The values [REVIEW,CANCELLED] on the enum `ProjectStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."ProjectStatus_new" AS ENUM ('TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE', 'REJECTED');
ALTER TABLE "public"."project" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."project" ALTER COLUMN "status" TYPE "public"."ProjectStatus_new" USING ("status"::text::"public"."ProjectStatus_new");
ALTER TYPE "public"."ProjectStatus" RENAME TO "ProjectStatus_old";
ALTER TYPE "public"."ProjectStatus_new" RENAME TO "ProjectStatus";
DROP TYPE "public"."ProjectStatus_old";
ALTER TABLE "public"."project" ALTER COLUMN "status" SET DEFAULT 'TODO';
COMMIT;
