-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CertificationType" ADD VALUE 'USDA_GAP';
ALTER TYPE "CertificationType" ADD VALUE 'IFS';
ALTER TYPE "CertificationType" ADD VALUE 'SQF';
ALTER TYPE "CertificationType" ADD VALUE 'HARMONIZED_GAP';
ALTER TYPE "CertificationType" ADD VALUE 'NON_GMO_PROJECT';
ALTER TYPE "CertificationType" ADD VALUE 'FAIR_TRADE_USA';
ALTER TYPE "CertificationType" ADD VALUE 'FAIRTRADE_INTERNATIONAL';
ALTER TYPE "CertificationType" ADD VALUE 'COMERCIO_JUSTO_CLAC';
ALTER TYPE "CertificationType" ADD VALUE 'CERTIFIED_NATURALLY_GROWN';
ALTER TYPE "CertificationType" ADD VALUE 'AMERICAN_GRASSFED';
ALTER TYPE "CertificationType" ADD VALUE 'ANIMAL_WELFARE_APPROVED';
ALTER TYPE "CertificationType" ADD VALUE 'BPA_SENASA_AR';
ALTER TYPE "CertificationType" ADD VALUE 'BPA_SENASICA_MX';
ALTER TYPE "CertificationType" ADD VALUE 'ORGANICO_SENASA_AR';
ALTER TYPE "CertificationType" ADD VALUE 'MEXICO_ORGANICO';
ALTER TYPE "CertificationType" ADD VALUE 'ORGANICO_BRASIL_IBD';
ALTER TYPE "CertificationType" ADD VALUE 'LEAF_MARQUE';
ALTER TYPE "CertificationType" ADD VALUE 'BONSUCRO';
ALTER TYPE "CertificationType" ADD VALUE 'RSPO';
ALTER TYPE "CertificationType" ADD VALUE 'FOUR_C';
ALTER TYPE "CertificationType" ADD VALUE 'ISO_14001';
ALTER TYPE "CertificationType" ADD VALUE 'CARBON_FOOTPRINT';
ALTER TYPE "CertificationType" ADD VALUE 'SEDEX_SMETA';
ALTER TYPE "CertificationType" ADD VALUE 'TESCO_NURTURE';
