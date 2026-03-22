-- Expand diagnostics to match health app form + farm/field scope

ALTER TABLE "diagnostics" ADD COLUMN "farm_id" TEXT;
ALTER TABLE "diagnostics" ADD COLUMN "field_id" TEXT;
ALTER TABLE "diagnostics" ADD COLUMN "origin" TEXT NOT NULL DEFAULT 'direct_detection';
ALTER TABLE "diagnostics" ADD COLUMN "problem_type" TEXT;
ALTER TABLE "diagnostics" ADD COLUMN "problem_identified" TEXT;
ALTER TABLE "diagnostics" ADD COLUMN "symptoms" TEXT NOT NULL DEFAULT '';
ALTER TABLE "diagnostics" ADD COLUMN "affected_area_percentage" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "diagnostics" ADD COLUMN "photos" JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE "diagnostics" ADD COLUMN "possible_cause" TEXT NOT NULL DEFAULT '';
ALTER TABLE "diagnostics" ADD COLUMN "contributing_factors" JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE "diagnostics" ADD COLUMN "crop_stage" TEXT;
ALTER TABLE "diagnostics" ADD COLUMN "treatment_strategy" TEXT NOT NULL DEFAULT 'chemical';
ALTER TABLE "diagnostics" ADD COLUMN "recommended_products" JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE "diagnostics" ADD COLUMN "additional_instructions" TEXT;
ALTER TABLE "diagnostics" ADD COLUMN "estimated_cost" DOUBLE PRECISION;
ALTER TABLE "diagnostics" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'pending';

UPDATE "diagnostics" SET "problem_type" = "type" WHERE "problem_type" IS NULL;
UPDATE "diagnostics" SET "problem_identified" = COALESCE("type", 'Legacy') WHERE "problem_identified" IS NULL;
UPDATE "diagnostics" SET "symptoms" = COALESCE("notes", '');
UPDATE "diagnostics" SET "severity" = COALESCE("severity", 'low');

UPDATE "diagnostics" d
SET "farm_id" = sr."farm_id", "field_id" = sr."field_id"
FROM "scouting_records" sr
WHERE d."scouting_record_id" = sr."id";

UPDATE "diagnostics" d
SET "farm_id" = a."farm_id", "field_id" = COALESCE(d."field_id", a."field_id")
FROM "animals" a
WHERE d."animal_id" = a."id" AND d."farm_id" IS NULL;

UPDATE "diagnostics" SET "diagnosis_date" = COALESCE("diagnosis_date", CURRENT_DATE) WHERE "diagnosis_date" IS NULL;

DELETE FROM "diagnostics" WHERE "farm_id" IS NULL OR "field_id" IS NULL;

ALTER TABLE "diagnostics" ALTER COLUMN "farm_id" SET NOT NULL;
ALTER TABLE "diagnostics" ALTER COLUMN "field_id" SET NOT NULL;
ALTER TABLE "diagnostics" ALTER COLUMN "problem_type" SET NOT NULL;
ALTER TABLE "diagnostics" ALTER COLUMN "problem_identified" SET NOT NULL;
ALTER TABLE "diagnostics" ALTER COLUMN "diagnosis_date" SET NOT NULL;
ALTER TABLE "diagnostics" ALTER COLUMN "severity" SET NOT NULL;

ALTER TABLE "diagnostics" DROP COLUMN "type";
ALTER TABLE "diagnostics" DROP COLUMN "notes";

ALTER TABLE "diagnostics" ADD CONSTRAINT "diagnostics_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "diagnostics" ADD CONSTRAINT "diagnostics_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "fields"("id") ON DELETE CASCADE ON UPDATE CASCADE;
