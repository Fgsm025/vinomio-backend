/*
  Warnings:

  - You are about to drop the column `associated_plots` on the `fields` table. All the data in the column will be lost.
  - You are about to drop the column `total_area` on the `fields` table. All the data in the column will be lost.
  - Made the column `surface` on table `plots` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "fields" DROP COLUMN "associated_plots",
DROP COLUMN "total_area";

-- AlterTable
ALTER TABLE "plots" ADD COLUMN     "geometry" JSONB,
ADD COLUMN     "is_auto_generated" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "surface" SET NOT NULL;
