-- AlterTable
ALTER TABLE "stock" ADD COLUMN     "crop_cycle_id" TEXT;

-- AlterTable
ALTER TABLE "supplies" ADD COLUMN     "carbon_factor" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'OTHER';

-- AddForeignKey
ALTER TABLE "stock" ADD CONSTRAINT "stock_crop_cycle_id_fkey" FOREIGN KEY ("crop_cycle_id") REFERENCES "crop_cycles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
