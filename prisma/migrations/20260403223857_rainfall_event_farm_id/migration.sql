-- DropForeignKey
ALTER TABLE "rainfall_events" DROP CONSTRAINT "rainfall_events_field_id_fkey";

-- Add farm_id (nullable first), make field_id optional
ALTER TABLE "rainfall_events" ADD COLUMN "farm_id" TEXT;
ALTER TABLE "rainfall_events" ALTER COLUMN "field_id" DROP NOT NULL;

-- Backfill farm from linked field
UPDATE "rainfall_events" re
SET "farm_id" = f."farm_id"
FROM "fields" f
WHERE re."field_id" = f."id" AND f."farm_id" IS NOT NULL;

-- Remove rows that could not be mapped (orphan data)
DELETE FROM "rainfall_events" WHERE "farm_id" IS NULL;

ALTER TABLE "rainfall_events" ALTER COLUMN "farm_id" SET NOT NULL;

-- CreateIndex
CREATE INDEX "rainfall_events_farm_id_idx" ON "rainfall_events"("farm_id");

-- AddForeignKey
ALTER TABLE "rainfall_events" ADD CONSTRAINT "rainfall_events_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "rainfall_events" ADD CONSTRAINT "rainfall_events_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "fields"("id") ON DELETE SET NULL ON UPDATE CASCADE;
