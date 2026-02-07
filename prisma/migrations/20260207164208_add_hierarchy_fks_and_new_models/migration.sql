-- AlterTable
ALTER TABLE "animals" ADD COLUMN     "production_unit_id" TEXT;

-- AlterTable
ALTER TABLE "facilities" ADD COLUMN     "production_unit_id" TEXT,
ADD COLUMN     "sector_id" TEXT;

-- AlterTable
ALTER TABLE "machinery" ADD COLUMN     "production_unit_id" TEXT;

-- AlterTable
ALTER TABLE "water_sources" ADD COLUMN     "production_unit_id" TEXT;

-- CreateTable
CREATE TABLE "crop_cycles" (
    "id" TEXT NOT NULL,
    "crop_id" TEXT NOT NULL,
    "variety" TEXT,
    "production_unit_id" TEXT,
    "sector_id" TEXT NOT NULL,
    "region" TEXT,
    "planting_date" TIMESTAMP(3) NOT NULL,
    "planted_area" DOUBLE PRECISION,
    "plant_count" INTEGER,
    "plant_density" DOUBLE PRECISION,
    "current_status" TEXT NOT NULL,
    "phenology_template_id" TEXT,
    "manual_adjustments" JSONB,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crop_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "livestock_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "animal_ids" TEXT[],
    "production_unit_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "livestock_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grazing_locations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "polygon_id" TEXT,
    "livestock_group_id" TEXT,
    "animal_count" INTEGER,
    "surface" DOUBLE PRECISION NOT NULL,
    "entry_date" TIMESTAMP(3),
    "days_in_location" INTEGER,
    "animal_days_per_acre" DOUBLE PRECISION,
    "sector_id" TEXT NOT NULL,
    "color" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grazing_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "irrigation_schedules" (
    "id" TEXT NOT NULL,
    "schedule_name" TEXT NOT NULL,
    "production_unit_id" TEXT,
    "sector_id" TEXT,
    "field_name" TEXT,
    "lot_name" TEXT,
    "crop_type" TEXT,
    "irrigation_method" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "frequency" TEXT,
    "duration" INTEGER,
    "water_volume" DOUBLE PRECISION,
    "next_scheduled_date" TIMESTAMP(3),
    "last_executed_date" TIMESTAMP(3),
    "start_time" TEXT,
    "end_time" TEXT,
    "days_of_week" TEXT[],
    "soil_moisture_threshold" DOUBLE PRECISION,
    "weather_dependent" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "irrigation_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rainfall_events" (
    "id" TEXT NOT NULL,
    "production_unit_id" TEXT NOT NULL,
    "sector_id" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "amount_mm" DOUBLE PRECISION,
    "intensity" TEXT,
    "source" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rainfall_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "exploitation_id" TEXT NOT NULL,
    "role" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "start_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "traceability_records" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "lot_number" TEXT NOT NULL,
    "exploitation_id" TEXT NOT NULL,
    "production_unit_id" TEXT,
    "sector_id" TEXT,
    "application_date" TIMESTAMP(3) NOT NULL,
    "applied_by" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "traceability_records_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_production_unit_id_fkey" FOREIGN KEY ("production_unit_id") REFERENCES "production_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machinery" ADD CONSTRAINT "machinery_production_unit_id_fkey" FOREIGN KEY ("production_unit_id") REFERENCES "production_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animals" ADD CONSTRAINT "animals_production_unit_id_fkey" FOREIGN KEY ("production_unit_id") REFERENCES "production_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "water_sources" ADD CONSTRAINT "water_sources_production_unit_id_fkey" FOREIGN KEY ("production_unit_id") REFERENCES "production_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crop_cycles" ADD CONSTRAINT "crop_cycles_crop_id_fkey" FOREIGN KEY ("crop_id") REFERENCES "crops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crop_cycles" ADD CONSTRAINT "crop_cycles_production_unit_id_fkey" FOREIGN KEY ("production_unit_id") REFERENCES "production_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crop_cycles" ADD CONSTRAINT "crop_cycles_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "livestock_groups" ADD CONSTRAINT "livestock_groups_production_unit_id_fkey" FOREIGN KEY ("production_unit_id") REFERENCES "production_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grazing_locations" ADD CONSTRAINT "grazing_locations_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grazing_locations" ADD CONSTRAINT "grazing_locations_livestock_group_id_fkey" FOREIGN KEY ("livestock_group_id") REFERENCES "livestock_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "irrigation_schedules" ADD CONSTRAINT "irrigation_schedules_production_unit_id_fkey" FOREIGN KEY ("production_unit_id") REFERENCES "production_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "irrigation_schedules" ADD CONSTRAINT "irrigation_schedules_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rainfall_events" ADD CONSTRAINT "rainfall_events_production_unit_id_fkey" FOREIGN KEY ("production_unit_id") REFERENCES "production_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rainfall_events" ADD CONSTRAINT "rainfall_events_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_exploitation_id_fkey" FOREIGN KEY ("exploitation_id") REFERENCES "exploitations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traceability_records" ADD CONSTRAINT "traceability_records_exploitation_id_fkey" FOREIGN KEY ("exploitation_id") REFERENCES "exploitations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traceability_records" ADD CONSTRAINT "traceability_records_production_unit_id_fkey" FOREIGN KEY ("production_unit_id") REFERENCES "production_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traceability_records" ADD CONSTRAINT "traceability_records_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
