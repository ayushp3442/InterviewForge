/*
  Warnings:

  - You are about to drop the column `technicalScore` on the `Report` table. All the data in the column will be lost.
  - The `strengths` column on the `Report` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `weaknesses` column on the `Report` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `score` on the `Response` table. All the data in the column will be lost.
  - The `parsedJson` column on the `Resume` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "sourceSkill" TEXT;

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "technicalScore",
ADD COLUMN     "correctnessScore" INTEGER,
ADD COLUMN     "structureScore" INTEGER,
DROP COLUMN "strengths",
ADD COLUMN     "strengths" JSONB,
DROP COLUMN "weaknesses",
ADD COLUMN     "weaknesses" JSONB;

-- AlterTable
ALTER TABLE "Response" DROP COLUMN "score",
ADD COLUMN     "communicationScore" INTEGER,
ADD COLUMN     "correctnessScore" INTEGER,
ADD COLUMN     "structureScore" INTEGER;

-- AlterTable
ALTER TABLE "Resume" DROP COLUMN "parsedJson",
ADD COLUMN     "parsedJson" JSONB;
