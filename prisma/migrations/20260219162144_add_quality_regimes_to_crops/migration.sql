-- AlterTable
ALTER TABLE "crops" ADD COLUMN     "quality_regimes" TEXT[] DEFAULT ARRAY[]::TEXT[];
