-- AlterTable
ALTER TABLE "rainfall_events" ADD COLUMN     "crop_cycle_id" TEXT;

-- CreateIndex
CREATE INDEX "rainfall_events_crop_cycle_id_idx" ON "rainfall_events"("crop_cycle_id");

-- AddForeignKey
ALTER TABLE "rainfall_events" ADD CONSTRAINT "rainfall_events_crop_cycle_id_fkey" FOREIGN KEY ("crop_cycle_id") REFERENCES "crop_cycles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
