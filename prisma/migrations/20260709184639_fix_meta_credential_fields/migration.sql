/*
  Warnings:

  - You are about to drop the column `facebookAccessToken` on the `MetaCredential` table. All the data in the column will be lost.
  - You are about to drop the column `facebookTokenExpiresAt` on the `MetaCredential` table. All the data in the column will be lost.
  - Added the required column `facebookPageAccessToken` to the `MetaCredential` table without a default value. This is not possible if the table is not empty.
  - Added the required column `facebookUserToken` to the `MetaCredential` table without a default value. This is not possible if the table is not empty.
  - Added the required column `facebookUserTokenExpiresAt` to the `MetaCredential` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MetaCredential" DROP COLUMN "facebookAccessToken",
DROP COLUMN "facebookTokenExpiresAt",
ADD COLUMN     "facebookPageAccessToken" TEXT NOT NULL,
ADD COLUMN     "facebookUserToken" TEXT NOT NULL,
ADD COLUMN     "facebookUserTokenExpiresAt" TIMESTAMP(3) NOT NULL;
