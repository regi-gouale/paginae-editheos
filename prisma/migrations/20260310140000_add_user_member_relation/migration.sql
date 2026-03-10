-- AlterTable
ALTER TABLE "member" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "member" ALTER COLUMN "role" SET DEFAULT 'CONTRIBUTOR';

-- CreateIndex
CREATE UNIQUE INDEX "member_userId_key" ON "member"("userId");

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
