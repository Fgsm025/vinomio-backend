/*
  Warnings:

  - You are about to drop the column `exploitation_id` on the `animals` table. All the data in the column will be lost.
  - You are about to drop the column `production_unit_id` on the `animals` table. All the data in the column will be lost.
  - You are about to drop the column `production_unit_id` on the `crop_cycles` table. All the data in the column will be lost.
  - You are about to drop the column `sector_id` on the `crop_cycles` table. All the data in the column will be lost.
  - You are about to drop the column `production_unit_id` on the `facilities` table. All the data in the column will be lost.
  - You are about to drop the column `sector_id` on the `facilities` table. All the data in the column will be lost.
  - You are about to drop the column `sector_id` on the `grazing_locations` table. All the data in the column will be lost.
  - You are about to drop the column `exploitation_id` on the `invitations` table. All the data in the column will be lost.
  - You are about to drop the column `production_unit_id` on the `irrigation_schedules` table. All the data in the column will be lost.
  - You are about to drop the column `production_unit_id` on the `livestock_groups` table. All the data in the column will be lost.
  - You are about to drop the column `exploitation_id` on the `machinery` table. All the data in the column will be lost.
  - You are about to drop the column `production_unit_id` on the `machinery` table. All the data in the column will be lost.
  - You are about to drop the column `exploitation_id` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `exploitation_id` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `production_unit_id` on the `rainfall_events` table. All the data in the column will be lost.
  - You are about to drop the column `sector_id` on the `rainfall_events` table. All the data in the column will be lost.
  - You are about to drop the column `exploitation_id` on the `stock` table. All the data in the column will be lost.
  - You are about to drop the column `exploitation_id` on the `suppliers` table. All the data in the column will be lost.
  - You are about to drop the column `exploitation_id` on the `team_members` table. All the data in the column will be lost.
  - You are about to drop the column `exploitation_id` on the `traceability_records` table. All the data in the column will be lost.
  - You are about to drop the column `production_unit_id` on the `traceability_records` table. All the data in the column will be lost.
  - You are about to drop the column `sector_id` on the `traceability_records` table. All the data in the column will be lost.
  - You are about to drop the column `distance_to_exploitation` on the `water_sources` table. All the data in the column will be lost.
  - You are about to drop the column `production_unit_id` on the `water_sources` table. All the data in the column will be lost.
  - You are about to drop the `exploitations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `production_units` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sector_on_irrigation_schedule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sectors` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_exploitations` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `plot_id` to the `crop_cycles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `plot_id` to the `grazing_locations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `farm_id` to the `invitations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `farm_id` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `farm_id` to the `purchases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `field_id` to the `rainfall_events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `farm_id` to the `stock` table without a default value. This is not possible if the table is not empty.
  - Added the required column `farm_id` to the `suppliers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `farm_id` to the `team_members` table without a default value. This is not possible if the table is not empty.
  - Added the required column `farm_id` to the `traceability_records` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "animals" DROP CONSTRAINT "animals_exploitation_id_fkey";

-- DropForeignKey
ALTER TABLE "animals" DROP CONSTRAINT "animals_production_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "crop_cycles" DROP CONSTRAINT "crop_cycles_production_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "crop_cycles" DROP CONSTRAINT "crop_cycles_sector_id_fkey";

-- DropForeignKey
ALTER TABLE "facilities" DROP CONSTRAINT "facilities_production_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "facilities" DROP CONSTRAINT "facilities_sector_id_fkey";

-- DropForeignKey
ALTER TABLE "grazing_locations" DROP CONSTRAINT "grazing_locations_sector_id_fkey";

-- DropForeignKey
ALTER TABLE "invitations" DROP CONSTRAINT "invitations_exploitation_id_fkey";

-- DropForeignKey
ALTER TABLE "irrigation_schedules" DROP CONSTRAINT "irrigation_schedules_production_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "livestock_groups" DROP CONSTRAINT "livestock_groups_production_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "machinery" DROP CONSTRAINT "machinery_exploitation_id_fkey";

-- DropForeignKey
ALTER TABLE "machinery" DROP CONSTRAINT "machinery_production_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "production_units" DROP CONSTRAINT "production_units_exploitation_id_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_exploitation_id_fkey";

-- DropForeignKey
ALTER TABLE "purchases" DROP CONSTRAINT "purchases_exploitation_id_fkey";

-- DropForeignKey
ALTER TABLE "rainfall_events" DROP CONSTRAINT "rainfall_events_production_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "rainfall_events" DROP CONSTRAINT "rainfall_events_sector_id_fkey";

-- DropForeignKey
ALTER TABLE "sector_on_irrigation_schedule" DROP CONSTRAINT "sector_on_irrigation_schedule_irrigation_schedule_id_fkey";

-- DropForeignKey
ALTER TABLE "sector_on_irrigation_schedule" DROP CONSTRAINT "sector_on_irrigation_schedule_sector_id_fkey";

-- DropForeignKey
ALTER TABLE "sectors" DROP CONSTRAINT "sectors_production_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "stock" DROP CONSTRAINT "stock_exploitation_id_fkey";

-- DropForeignKey
ALTER TABLE "suppliers" DROP CONSTRAINT "suppliers_exploitation_id_fkey";

-- DropForeignKey
ALTER TABLE "team_members" DROP CONSTRAINT "team_members_exploitation_id_fkey";

-- DropForeignKey
ALTER TABLE "traceability_records" DROP CONSTRAINT "traceability_records_exploitation_id_fkey";

-- DropForeignKey
ALTER TABLE "traceability_records" DROP CONSTRAINT "traceability_records_production_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "traceability_records" DROP CONSTRAINT "traceability_records_sector_id_fkey";

-- DropForeignKey
ALTER TABLE "user_exploitations" DROP CONSTRAINT "user_exploitations_exploitation_id_fkey";

-- DropForeignKey
ALTER TABLE "user_exploitations" DROP CONSTRAINT "user_exploitations_user_id_fkey";

-- DropForeignKey
ALTER TABLE "water_sources" DROP CONSTRAINT "water_sources_production_unit_id_fkey";

-- AlterTable
ALTER TABLE "animals" DROP COLUMN "exploitation_id",
DROP COLUMN "production_unit_id",
ADD COLUMN     "farm_id" TEXT,
ADD COLUMN     "field_id" TEXT;

-- AlterTable
ALTER TABLE "crop_cycles" DROP COLUMN "production_unit_id",
DROP COLUMN "sector_id",
ADD COLUMN     "field_id" TEXT,
ADD COLUMN     "plot_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "facilities" DROP COLUMN "production_unit_id",
DROP COLUMN "sector_id",
ADD COLUMN     "field_id" TEXT,
ADD COLUMN     "plot_id" TEXT;

-- AlterTable
ALTER TABLE "grazing_locations" DROP COLUMN "sector_id",
ADD COLUMN     "plot_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "invitations" DROP COLUMN "exploitation_id",
ADD COLUMN     "farm_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "irrigation_schedules" DROP COLUMN "production_unit_id",
ADD COLUMN     "field_id" TEXT;

-- AlterTable
ALTER TABLE "livestock_groups" DROP COLUMN "production_unit_id",
ADD COLUMN     "field_id" TEXT;

-- AlterTable
ALTER TABLE "machinery" DROP COLUMN "exploitation_id",
DROP COLUMN "production_unit_id",
ADD COLUMN     "farm_id" TEXT,
ADD COLUMN     "field_id" TEXT;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "exploitation_id",
ADD COLUMN     "farm_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "purchases" DROP COLUMN "exploitation_id",
ADD COLUMN     "farm_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "rainfall_events" DROP COLUMN "production_unit_id",
DROP COLUMN "sector_id",
ADD COLUMN     "field_id" TEXT NOT NULL,
ADD COLUMN     "plot_id" TEXT;

-- AlterTable
ALTER TABLE "stock" DROP COLUMN "exploitation_id",
ADD COLUMN     "farm_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "suppliers" DROP COLUMN "exploitation_id",
ADD COLUMN     "farm_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "team_members" DROP COLUMN "exploitation_id",
ADD COLUMN     "farm_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "traceability_records" DROP COLUMN "exploitation_id",
DROP COLUMN "production_unit_id",
DROP COLUMN "sector_id",
ADD COLUMN     "farm_id" TEXT NOT NULL,
ADD COLUMN     "field_id" TEXT,
ADD COLUMN     "plot_id" TEXT;

-- AlterTable
ALTER TABLE "water_sources" DROP COLUMN "distance_to_exploitation",
DROP COLUMN "production_unit_id",
ADD COLUMN     "distance_to_farm" DOUBLE PRECISION,
ADD COLUMN     "field_id" TEXT;

-- DropTable
DROP TABLE "exploitations";

-- DropTable
DROP TABLE "production_units";

-- DropTable
DROP TABLE "sector_on_irrigation_schedule";

-- DropTable
DROP TABLE "sectors";

-- DropTable
DROP TABLE "user_exploitations";

-- CreateTable
CREATE TABLE "farms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "country" TEXT,
    "province" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_farms" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_farms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fields" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "farm_id" TEXT,
    "production_type" TEXT NOT NULL,
    "crop_category" TEXT,
    "specific_variety" TEXT,
    "year_established" INTEGER,
    "total_area" DOUBLE PRECISION,
    "associated_plots" TEXT[],
    "primary_location" TEXT,
    "management_type" TEXT NOT NULL,
    "certification" TEXT,
    "tenure_regime" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "has_irrigation_system" BOOLEAN NOT NULL DEFAULT false,
    "responsible_manager" TEXT,
    "expected_annual_production" JSONB,
    "notes" TEXT,
    "color" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plots" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sigpac_code" TEXT,
    "surface" DOUBLE PRECISION,
    "has_cadastral_reference" BOOLEAN NOT NULL DEFAULT false,
    "is_communal_pasture" BOOLEAN NOT NULL DEFAULT false,
    "is_pastures_common_in_common" BOOLEAN NOT NULL DEFAULT false,
    "tenure_regime" TEXT,
    "field_id" TEXT,
    "color" TEXT,
    "facility_building_ids" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plot_on_irrigation_schedule" (
    "irrigation_schedule_id" TEXT NOT NULL,
    "plot_id" TEXT NOT NULL,

    CONSTRAINT "plot_on_irrigation_schedule_pkey" PRIMARY KEY ("irrigation_schedule_id","plot_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_farms_user_id_farm_id_key" ON "user_farms"("user_id", "farm_id");

-- AddForeignKey
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "fields"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_plot_id_fkey" FOREIGN KEY ("plot_id") REFERENCES "plots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machinery" ADD CONSTRAINT "machinery_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machinery" ADD CONSTRAINT "machinery_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "fields"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animals" ADD CONSTRAINT "animals_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animals" ADD CONSTRAINT "animals_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "fields"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "water_sources" ADD CONSTRAINT "water_sources_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "fields"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_farms" ADD CONSTRAINT "user_farms_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_farms" ADD CONSTRAINT "user_farms_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fields" ADD CONSTRAINT "fields_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plots" ADD CONSTRAINT "plots_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "fields"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crop_cycles" ADD CONSTRAINT "crop_cycles_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "fields"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crop_cycles" ADD CONSTRAINT "crop_cycles_plot_id_fkey" FOREIGN KEY ("plot_id") REFERENCES "plots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "livestock_groups" ADD CONSTRAINT "livestock_groups_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "fields"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grazing_locations" ADD CONSTRAINT "grazing_locations_plot_id_fkey" FOREIGN KEY ("plot_id") REFERENCES "plots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "irrigation_schedules" ADD CONSTRAINT "irrigation_schedules_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "fields"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plot_on_irrigation_schedule" ADD CONSTRAINT "plot_on_irrigation_schedule_irrigation_schedule_id_fkey" FOREIGN KEY ("irrigation_schedule_id") REFERENCES "irrigation_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plot_on_irrigation_schedule" ADD CONSTRAINT "plot_on_irrigation_schedule_plot_id_fkey" FOREIGN KEY ("plot_id") REFERENCES "plots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rainfall_events" ADD CONSTRAINT "rainfall_events_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "fields"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rainfall_events" ADD CONSTRAINT "rainfall_events_plot_id_fkey" FOREIGN KEY ("plot_id") REFERENCES "plots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traceability_records" ADD CONSTRAINT "traceability_records_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traceability_records" ADD CONSTRAINT "traceability_records_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "fields"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traceability_records" ADD CONSTRAINT "traceability_records_plot_id_fkey" FOREIGN KEY ("plot_id") REFERENCES "plots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock" ADD CONSTRAINT "stock_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
