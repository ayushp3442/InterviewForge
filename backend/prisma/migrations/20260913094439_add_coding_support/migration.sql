-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('TEXT', 'CODING');

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "questionType" "QuestionType" NOT NULL DEFAULT 'TEXT';

-- CreateTable
CREATE TABLE "CodingProblem" (
    "id" SERIAL NOT NULL,
    "questionId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "constraints" TEXT,
    "starterCode" JSONB NOT NULL,
    "testCases" JSONB NOT NULL,

    CONSTRAINT "CodingProblem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodeSubmission" (
    "id" SERIAL NOT NULL,
    "codingProblemId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "passedTestCases" INTEGER NOT NULL DEFAULT 0,
    "totalTestCases" INTEGER NOT NULL DEFAULT 0,
    "executionTimeMs" INTEGER,
    "codeQualityScore" INTEGER,
    "timeComplexity" TEXT,
    "spaceComplexity" TEXT,
    "feedback" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CodeSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CodingProblem_questionId_key" ON "CodingProblem"("questionId");

-- AddForeignKey
ALTER TABLE "CodingProblem" ADD CONSTRAINT "CodingProblem_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeSubmission" ADD CONSTRAINT "CodeSubmission_codingProblemId_fkey" FOREIGN KEY ("codingProblemId") REFERENCES "CodingProblem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeSubmission" ADD CONSTRAINT "CodeSubmission_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeSubmission" ADD CONSTRAINT "CodeSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
