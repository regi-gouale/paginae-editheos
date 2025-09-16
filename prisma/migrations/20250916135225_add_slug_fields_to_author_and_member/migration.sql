/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `author` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `member` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `project` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."author" ADD COLUMN     "slug" TEXT;

-- AlterTable
ALTER TABLE "public"."member" ADD COLUMN     "slug" TEXT;

-- AlterTable
ALTER TABLE "public"."project" ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "author_slug_key" ON "public"."author"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "member_slug_key" ON "public"."member"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "project_slug_key" ON "public"."project"("slug");
