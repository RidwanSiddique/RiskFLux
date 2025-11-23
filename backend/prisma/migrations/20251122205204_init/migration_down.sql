-- DropForeignKey
ALTER TABLE "HazardFactorContribution" DROP CONSTRAINT "HazardFactorContribution_hazardScoreId_fkey";

-- DropForeignKey
ALTER TABLE "HazardScore" DROP CONSTRAINT "HazardScore_modelVersionId_fkey";

-- DropForeignKey
ALTER TABLE "HazardScore" DROP CONSTRAINT "HazardScore_locationId_fkey";

-- DropIndex
DROP INDEX "ApiKey_key_key";

-- DropIndex
DROP INDEX "KnowledgeBaseArticle_slug_key";

-- DropIndex
DROP INDEX "ModelVersion_name_key";

-- DropTable
DROP TABLE "ApiKey";

-- DropTable
DROP TABLE "Feedback";

-- DropTable
DROP TABLE "KnowledgeBaseArticle";

-- DropTable
DROP TABLE "HazardFactorContribution";

-- DropTable
DROP TABLE "HazardScore";

-- DropTable
DROP TABLE "ModelVersion";

-- DropTable
DROP TABLE "Location";
