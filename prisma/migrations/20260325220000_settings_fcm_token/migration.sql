-- AlterTable
ALTER TABLE "settings" ADD COLUMN "fcm_token" TEXT;
ALTER TABLE "settings" ADD COLUMN "email_notifications_enabled" BOOLEAN NOT NULL DEFAULT false;
