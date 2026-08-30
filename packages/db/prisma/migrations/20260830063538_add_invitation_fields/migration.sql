/*
  Warnings:

  - The values [APPROVED,REJECTED] on the enum `RequestStatus` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[email,organizationId]` on the table `OrganizationJoinRequest` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `OrganizationJoinRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiresAt` to the `OrganizationJoinRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invitedById` to the `OrganizationJoinRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RequestStatus_new" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED');
ALTER TABLE "public"."OrganizationJoinRequest" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "OrganizationJoinRequest" ALTER COLUMN "status" TYPE "RequestStatus_new" USING ("status"::text::"RequestStatus_new");
ALTER TYPE "RequestStatus" RENAME TO "RequestStatus_old";
ALTER TYPE "RequestStatus_new" RENAME TO "RequestStatus";
DROP TYPE "public"."RequestStatus_old";
ALTER TABLE "OrganizationJoinRequest" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropIndex
DROP INDEX "OrganizationJoinRequest_userId_organizationId_key";

-- AlterTable
ALTER TABLE "OrganizationJoinRequest" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "invitedById" TEXT NOT NULL,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'MEMBER',
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "OrganizationJoinRequest_email_idx" ON "OrganizationJoinRequest"("email");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationJoinRequest_email_organizationId_key" ON "OrganizationJoinRequest"("email", "organizationId");

-- AddForeignKey
ALTER TABLE "OrganizationJoinRequest" ADD CONSTRAINT "OrganizationJoinRequest_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
