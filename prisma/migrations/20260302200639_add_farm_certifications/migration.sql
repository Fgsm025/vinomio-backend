-- CreateEnum
CREATE TYPE "CertificationType" AS ENUM ('GLOBAL_GAP', 'USDA_ORGANIC', 'EU_ORGANIC', 'BIODYNAMIC_DEMETER', 'ROC', 'RAINFOREST_ALLIANCE', 'HACCP', 'BRC', 'ISO_22000', 'FLORVERDE', 'MPS');

-- CreateEnum
CREATE TYPE "CertificationStatus" AS ENUM ('ACTIVE', 'PENDING', 'EXPIRED');

-- CreateTable
CREATE TABLE "spray_records" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "plot_id" TEXT,
    "product_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "dose" DOUBLE PRECISION,
    "unit" TEXT DEFAULT 'l/ha',
    "operator" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spray_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scouting_records" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "plot_id" TEXT NOT NULL,
    "observation_date" DATE NOT NULL,
    "pest_or_issue" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scouting_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnostics" (
    "id" TEXT NOT NULL,
    "scouting_record_id" TEXT,
    "animal_id" TEXT,
    "diagnosis_date" DATE,
    "type" TEXT NOT NULL,
    "severity" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diagnostics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_templates" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "data_source" TEXT NOT NULL,
    "filters" JSONB NOT NULL,
    "group_by" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "columns" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farm_certifications" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "type" "CertificationType" NOT NULL,
    "status" "CertificationStatus" NOT NULL DEFAULT 'PENDING',
    "issue_date" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3),
    "certificate_url" TEXT,
    "complianceScore" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farm_certifications_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "spray_records" ADD CONSTRAINT "spray_records_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spray_records" ADD CONSTRAINT "spray_records_plot_id_fkey" FOREIGN KEY ("plot_id") REFERENCES "plots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spray_records" ADD CONSTRAINT "spray_records_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scouting_records" ADD CONSTRAINT "scouting_records_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scouting_records" ADD CONSTRAINT "scouting_records_plot_id_fkey" FOREIGN KEY ("plot_id") REFERENCES "plots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostics" ADD CONSTRAINT "diagnostics_scouting_record_id_fkey" FOREIGN KEY ("scouting_record_id") REFERENCES "scouting_records"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostics" ADD CONSTRAINT "diagnostics_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_templates" ADD CONSTRAINT "report_templates_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farm_certifications" ADD CONSTRAINT "farm_certifications_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
