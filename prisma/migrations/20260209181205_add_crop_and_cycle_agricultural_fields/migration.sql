-- AlterTable
ALTER TABLE "crop_cycles" ADD COLUMN     "actual_harvest_end_date" TIMESTAMP(3),
ADD COLUMN     "actual_harvest_start_date" TIMESTAMP(3),
ADD COLUMN     "actual_yield" DOUBLE PRECISION,
ADD COLUMN     "end_date" TIMESTAMP(3),
ADD COLUMN     "end_reason" TEXT,
ADD COLUMN     "estimated_harvest_date" TIMESTAMP(3),
ADD COLUMN     "next_planned_crop_id" TEXT,
ADD COLUMN     "nursery_origin" TEXT,
ADD COLUMN     "previous_crop_id" TEXT,
ADD COLUMN     "season" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "seed_batch" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN     "supplier" TEXT,
ADD COLUMN     "yield_unit" TEXT;

-- AlterTable
ALTER TABLE "crops" ADD COLUMN     "between_rows" DOUBLE PRECISION,
ADD COLUMN     "crop_destinations" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "estimated_yield_per_ha" DOUBLE PRECISION,
ADD COLUMN     "growing_days" INTEGER,
ADD COLUMN     "harvest_days" INTEGER,
ADD COLUMN     "harvest_type" TEXT,
ADD COLUMN     "lifespan" INTEGER,
ADD COLUMN     "maturation_days" INTEGER,
ADD COLUMN     "max_temperature" DOUBLE PRECISION,
ADD COLUMN     "min_temperature" DOUBLE PRECISION,
ADD COLUMN     "on_row" DOUBLE PRECISION,
ADD COLUMN     "planting_days" INTEGER,
ADD COLUMN     "post_harvest_days" INTEGER,
ADD COLUMN     "scientific_name" TEXT,
ADD COLUMN     "veraison_days" INTEGER,
ADD COLUMN     "water_requirements" TEXT,
ADD COLUMN     "yield_unit" TEXT;

UPDATE crops SET between_rows = horizontal_planting_frame WHERE horizontal_planting_frame IS NOT NULL;
UPDATE crops SET on_row = vertical_planting_frame WHERE vertical_planting_frame IS NOT NULL;
UPDATE crops SET maturation_days = COALESCE(maturation_days, veraison_days) WHERE veraison_days IS NOT NULL;
