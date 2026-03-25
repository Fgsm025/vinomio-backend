-- Time display preferences (timezone comes from farm location)
ALTER TABLE "settings" ADD COLUMN "use_24_hour_time" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "settings" ADD COLUMN "show_seconds" BOOLEAN NOT NULL DEFAULT false;
