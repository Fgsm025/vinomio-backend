-- CreateTable
CREATE TABLE "sector_on_irrigation_schedule" (
    "irrigation_schedule_id" TEXT NOT NULL,
    "sector_id" TEXT NOT NULL,

    CONSTRAINT "sector_on_irrigation_schedule_pkey" PRIMARY KEY ("irrigation_schedule_id","sector_id")
);

-- Backfill: copy existing sector_id into the new join table
INSERT INTO "sector_on_irrigation_schedule" ("irrigation_schedule_id", "sector_id")
SELECT "id", "sector_id" FROM "irrigation_schedules"
WHERE "sector_id" IS NOT NULL;

-- DropForeignKey
ALTER TABLE "irrigation_schedules" DROP CONSTRAINT IF EXISTS "irrigation_schedules_sector_id_fkey";

-- DropColumn
ALTER TABLE "irrigation_schedules" DROP COLUMN "sector_id";

-- AddForeignKey
ALTER TABLE "sector_on_irrigation_schedule" ADD CONSTRAINT "sector_on_irrigation_schedule_irrigation_schedule_id_fkey" FOREIGN KEY ("irrigation_schedule_id") REFERENCES "irrigation_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sector_on_irrigation_schedule" ADD CONSTRAINT "sector_on_irrigation_schedule_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
