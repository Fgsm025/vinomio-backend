/*
  Warnings:

  - You are about to drop the column `dose` on the `spray_records` table. All the data in the column will be lost.
  - You are about to drop the column `operator` on the `spray_records` table. All the data in the column will be lost.
  - You are about to drop the column `product_id` on the `spray_records` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `spray_records` table. All the data in the column will be lost.
  - Added the required column `application_method` to the `spray_records` table without a default value. This is not possible if the table is not empty.
  - Added the required column `application_type` to the `spray_records` table without a default value. This is not possible if the table is not empty.
  - Added the required column `area_applied` to the `spray_records` table without a default value. This is not possible if the table is not empty.
  - Added the required column `area_unit` to the `spray_records` table without a default value. This is not possible if the table is not empty.
  - Added the required column `field_id` to the `spray_records` table without a default value. This is not possible if the table is not empty.
  - Added the required column `responsible` to the `spray_records` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "spray_records" DROP CONSTRAINT "spray_records_product_id_fkey";

-- AlterTable
ALTER TABLE "irrigation_schedules" ADD COLUMN     "cooldown_minutes" INTEGER,
ADD COLUMN     "end_at" TIMESTAMP(3),
ADD COLUMN     "flow_rate" DOUBLE PRECISION,
ADD COLUMN     "max_cycles_per_day" INTEGER,
ADD COLUMN     "skip_if_rain" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "start_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "spray_records" DROP COLUMN "dose",
DROP COLUMN "operator",
DROP COLUMN "product_id",
DROP COLUMN "unit",
ADD COLUMN     "application_method" TEXT NOT NULL,
ADD COLUMN     "application_type" TEXT NOT NULL,
ADD COLUMN     "area_applied" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "area_unit" TEXT NOT NULL,
ADD COLUMN     "field_id" TEXT NOT NULL,
ADD COLUMN     "harvest_date" DATE,
ADD COLUMN     "phi" INTEGER,
ADD COLUMN     "photos" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "plot_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "responsible" TEXT NOT NULL,
ADD COLUMN     "target_pest_disease" TEXT,
ADD COLUMN     "temperature" DOUBLE PRECISION,
ADD COLUMN     "water_volume" DOUBLE PRECISION,
ADD COLUMN     "water_volume_unit" TEXT,
ADD COLUMN     "weather_conditions" TEXT,
ADD COLUMN     "wind_speed" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "spray_record_products" (
    "id" TEXT NOT NULL,
    "spray_record_id" TEXT NOT NULL,
    "product_id" TEXT,
    "product_name" TEXT NOT NULL,
    "dosage" DOUBLE PRECISION NOT NULL,
    "dosage_unit" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spray_record_products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "spray_record_products_spray_record_id_idx" ON "spray_record_products"("spray_record_id");

-- AddForeignKey
ALTER TABLE "spray_records" ADD CONSTRAINT "spray_records_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "fields"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spray_record_products" ADD CONSTRAINT "spray_record_products_spray_record_id_fkey" FOREIGN KEY ("spray_record_id") REFERENCES "spray_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spray_record_products" ADD CONSTRAINT "spray_record_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "supplies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
