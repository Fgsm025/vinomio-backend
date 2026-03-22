-- Align scouting_records with health scouting form (field + full form fields)

ALTER TABLE "scouting_records" ADD COLUMN "field_id" TEXT;
ALTER TABLE "scouting_records" ADD COLUMN "responsible" TEXT;
ALTER TABLE "scouting_records" ADD COLUMN "observations" TEXT NOT NULL DEFAULT '';
ALTER TABLE "scouting_records" ADD COLUMN "health_status" TEXT NOT NULL DEFAULT 'stable';
ALTER TABLE "scouting_records" ADD COLUMN "pest_detected" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "scouting_records" ADD COLUMN "disease_detected" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "scouting_records" ADD COLUMN "severity_level" TEXT NOT NULL DEFAULT 'low';
ALTER TABLE "scouting_records" ADD COLUMN "affected_area_percentage" DOUBLE PRECISION NOT NULL DEFAULT 0;

UPDATE "scouting_records" sr
SET "field_id" = p."field_id"
FROM "plots" p
WHERE sr."plot_id" = p."id";

UPDATE "scouting_records"
SET
  "observations" = COALESCE(NULLIF(TRIM("observations"), ''), "notes", "pest_or_issue", ''),
  "severity_level" = COALESCE("severity", 'low'),
  "responsible" = COALESCE("responsible", '');

ALTER TABLE "scouting_records" DROP CONSTRAINT "scouting_records_plot_id_fkey";

ALTER TABLE "scouting_records" ALTER COLUMN "plot_id" DROP NOT NULL;

ALTER TABLE "scouting_records" ADD CONSTRAINT "scouting_records_plot_id_fkey" FOREIGN KEY ("plot_id") REFERENCES "plots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "scouting_records" DROP COLUMN "pest_or_issue";
ALTER TABLE "scouting_records" DROP COLUMN "severity";
ALTER TABLE "scouting_records" DROP COLUMN "notes";

DELETE FROM "scouting_records" WHERE "field_id" IS NULL;

ALTER TABLE "scouting_records" ALTER COLUMN "field_id" SET NOT NULL;

ALTER TABLE "scouting_records" ALTER COLUMN "responsible" SET NOT NULL;

ALTER TABLE "scouting_records" ADD CONSTRAINT "scouting_records_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "fields"("id") ON DELETE CASCADE ON UPDATE CASCADE;
