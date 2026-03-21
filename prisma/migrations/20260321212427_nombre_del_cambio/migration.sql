/*
  Warnings:

  - You are about to drop the column `crop_system` on the `crops` table. All the data in the column will be lost.
  - You are about to drop the column `soil_coverage` on the `crops` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "crops" DROP COLUMN "crop_system",
DROP COLUMN "soil_coverage";
