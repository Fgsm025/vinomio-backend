-- AlterTable
ALTER TABLE "settings" ADD COLUMN "weather_alerts" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "settings" ADD COLUMN "task_updates" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "settings" ADD COLUMN "system_announcements" BOOLEAN NOT NULL DEFAULT true;
