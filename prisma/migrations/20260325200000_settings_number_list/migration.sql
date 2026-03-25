-- AlterTable
ALTER TABLE "settings" ADD COLUMN "number_format" TEXT NOT NULL DEFAULT '12,34,567.89';
ALTER TABLE "settings" ADD COLUMN "list_sort_order" TEXT NOT NULL DEFAULT 'Universal';
ALTER TABLE "settings" ALTER COLUMN "first_day_of_week" SET DEFAULT 0;
