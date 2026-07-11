-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "outline" JSONB;

-- AlterTable
ALTER TABLE "Roundup" ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "outline" JSONB;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Roundup" ADD CONSTRAINT "Roundup_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
