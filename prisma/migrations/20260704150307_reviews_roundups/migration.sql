-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "affiliateLinkAmazon" TEXT,
ADD COLUMN     "affiliateLinkMercadoLivre" TEXT,
ADD COLUMN     "keywordId" TEXT,
ADD COLUMN     "scheduledDate" TIMESTAMP(3),
ADD COLUMN     "sourceUrls" JSONB;

-- CreateTable
CREATE TABLE "Roundup" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "snippet" TEXT NOT NULL,
    "introContent" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "scheduledDate" TIMESTAMP(3),
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Roundup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoundupItem" (
    "id" TEXT NOT NULL,
    "roundupId" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "RoundupItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Roundup_slug_key" ON "Roundup"("slug");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "Keyword"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Roundup" ADD CONSTRAINT "Roundup_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoundupItem" ADD CONSTRAINT "RoundupItem_roundupId_fkey" FOREIGN KEY ("roundupId") REFERENCES "Roundup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoundupItem" ADD CONSTRAINT "RoundupItem_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
