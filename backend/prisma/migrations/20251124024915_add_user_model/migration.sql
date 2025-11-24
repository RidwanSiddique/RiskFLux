/*
  Warnings:

  - Added the required column `userId` to the `HazardScore` table without a default value. This is not possible if the table is not empty.

*/

-- CreateTable for User first
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Create a default user for existing hazard scores
INSERT INTO "User" (id, email, password, name, "updatedAt") 
VALUES ('default-user', 'default@riskflux.local', 'N/A', 'Default User', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- AlterTable - Add userId with default value first
ALTER TABLE "HazardScore" ADD COLUMN "userId" TEXT DEFAULT 'default-user';

-- Update the column to be NOT NULL
ALTER TABLE "HazardScore" ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "HazardScore" ADD CONSTRAINT "HazardScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
