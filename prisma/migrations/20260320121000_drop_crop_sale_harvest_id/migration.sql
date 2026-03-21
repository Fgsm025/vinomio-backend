-- Drop deprecated batch/harvest reference from crop sales
ALTER TABLE "crop_sales" DROP COLUMN "harvest_id";
