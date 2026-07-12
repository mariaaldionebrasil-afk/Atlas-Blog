-- AlterTable
ALTER TABLE "RoundupItem" ALTER COLUMN "reviewId" DROP NOT NULL;
ALTER TABLE "RoundupItem" ADD COLUMN     "postId" TEXT;

-- AddForeignKey
ALTER TABLE "RoundupItem" ADD CONSTRAINT "RoundupItem_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CheckConstraint (satélite deve referenciar exatamente um: Review OU Post)
ALTER TABLE "RoundupItem" ADD CONSTRAINT "RoundupItem_review_or_post_check"
  CHECK (("reviewId" IS NOT NULL AND "postId" IS NULL) OR ("reviewId" IS NULL AND "postId" IS NOT NULL));
