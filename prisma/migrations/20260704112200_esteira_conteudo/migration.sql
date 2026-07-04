-- CreateEnum
CREATE TYPE "SiloType" AS ENUM ('PILAR', 'APOIO', 'SATELITE');

-- CreateEnum
CREATE TYPE "KeywordStatus" AS ENUM ('PENDENTE', 'APROVADA', 'CANIBALIZADA', 'REMOVIDA');

-- AlterEnum
ALTER TYPE "ContentStatus" ADD VALUE 'SCHEDULED';

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "keywordId" TEXT,
ADD COLUMN     "outline" JSONB,
ADD COLUMN     "scheduledDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Keyword" (
    "id" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "searchIntent" TEXT,
    "volume" INTEGER,
    "cpc" DOUBLE PRECISION,
    "status" "KeywordStatus" NOT NULL DEFAULT 'PENDENTE',
    "cannibalizationNote" TEXT,
    "siloId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Keyword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Silo" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "SiloType" NOT NULL,
    "parentId" TEXT,

    CONSTRAINT "Silo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Keyword" ADD CONSTRAINT "Keyword_siloId_fkey" FOREIGN KEY ("siloId") REFERENCES "Silo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Silo" ADD CONSTRAINT "Silo_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Silo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "Keyword"("id") ON DELETE SET NULL ON UPDATE CASCADE;
