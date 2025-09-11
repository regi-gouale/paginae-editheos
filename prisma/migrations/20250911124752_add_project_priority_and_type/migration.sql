-- CreateEnum
CREATE TYPE "public"."Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."ProjectType" AS ENUM ('EDITION', 'PRINTING');

-- AlterTable
ALTER TABLE "public"."project" ADD COLUMN     "priority" "public"."Priority" NOT NULL DEFAULT 'LOW',
ADD COLUMN     "type" "public"."ProjectType" NOT NULL DEFAULT 'EDITION';
