/*
  Warnings:

  - You are about to drop the column `created_at` on the `pipeline_deals` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `pipeline_deals` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "pipeline_deals" DROP COLUMN "created_at",
DROP COLUMN "updated_at";
