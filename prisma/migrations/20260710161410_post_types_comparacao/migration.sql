-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('APOIO', 'INFORMACIONAL', 'COMPARACAO');

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Roundup" DROP CONSTRAINT "Roundup_authorId_fkey";

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "affiliateLinkAmazon" TEXT,
ADD COLUMN     "affiliateLinkMercadoLivre" TEXT,
ADD COLUMN     "comparedReviewIdA" TEXT,
ADD COLUMN     "comparedReviewIdB" TEXT,
ADD COLUMN     "postType" "PostType",
ADD COLUMN     "roundupId" TEXT,
ADD COLUMN     "searchIntentFormat" TEXT,
ALTER COLUMN "publishedDate" DROP NOT NULL,
ALTER COLUMN "categoryId" DROP NOT NULL,
ALTER COLUMN "authorId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "searchIntentFormat" TEXT,
ALTER COLUMN "rating" DROP NOT NULL,
ALTER COLUMN "authorId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Roundup" ADD COLUMN     "keywordId" TEXT,
ADD COLUMN     "searchIntentFormat" TEXT,
ALTER COLUMN "authorId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_comparedReviewIdA_fkey" FOREIGN KEY ("comparedReviewIdA") REFERENCES "Review"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_comparedReviewIdB_fkey" FOREIGN KEY ("comparedReviewIdB") REFERENCES "Review"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_roundupId_fkey" FOREIGN KEY ("roundupId") REFERENCES "Roundup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Roundup" ADD CONSTRAINT "Roundup_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Roundup" ADD CONSTRAINT "Roundup_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "Keyword"("id") ON DELETE SET NULL ON UPDATE CASCADE;
