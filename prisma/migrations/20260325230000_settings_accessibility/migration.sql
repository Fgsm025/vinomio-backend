-- AlterTable
ALTER TABLE "settings" ADD COLUMN "font_size_adjustment" INTEGER NOT NULL DEFAULT 100;
ALTER TABLE "settings" ADD COLUMN "color_filter" TEXT NOT NULL DEFAULT 'none';
ALTER TABLE "settings" ADD COLUMN "color_filter_enabled" BOOLEAN NOT NULL DEFAULT false;
