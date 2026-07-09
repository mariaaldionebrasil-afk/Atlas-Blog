-- CreateEnum
CREATE TYPE "SocialNetwork" AS ENUM ('FACEBOOK', 'INSTAGRAM');

-- CreateEnum
CREATE TYPE "SocialPublicationStatus" AS ENUM ('SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "MetaCredential" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "facebookAccessToken" TEXT NOT NULL,
    "facebookTokenExpiresAt" TIMESTAMP(3) NOT NULL,
    "instagramAccessToken" TEXT NOT NULL,
    "instagramTokenExpiresAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MetaCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialPublication" (
    "id" TEXT NOT NULL,
    "postId" TEXT,
    "reviewId" TEXT,
    "roundupId" TEXT,
    "network" "SocialNetwork" NOT NULL,
    "status" "SocialPublicationStatus" NOT NULL,
    "externalId" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialPublication_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SocialPublication" ADD CONSTRAINT "SocialPublication_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialPublication" ADD CONSTRAINT "SocialPublication_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialPublication" ADD CONSTRAINT "SocialPublication_roundupId_fkey" FOREIGN KEY ("roundupId") REFERENCES "Roundup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
