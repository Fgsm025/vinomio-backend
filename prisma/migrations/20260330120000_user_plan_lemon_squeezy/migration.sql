-- AlterTable
ALTER TABLE "users" ADD COLUMN "plan_status" TEXT NOT NULL DEFAULT 'free';
ALTER TABLE "users" ADD COLUMN "ls_subscription_id" TEXT;
ALTER TABLE "users" ADD COLUMN "ends_at" TIMESTAMP(3);
