/*
  Warnings:

  - The primary key for the `document_chunks` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `categoria` on the `document_chunks` table. All the data in the column will be lost.
  - You are about to drop the column `cultivo_id` on the `document_chunks` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_validez` on the `document_chunks` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `document_chunks` table. All the data in the column will be lost.
  - You are about to drop the column `pais` on the `document_chunks` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "document_chunks" DROP CONSTRAINT "document_chunks_pkey",
DROP COLUMN "categoria",
DROP COLUMN "cultivo_id",
DROP COLUMN "fecha_validez",
DROP COLUMN "metadata",
DROP COLUMN "pais",
ADD COLUMN     "category" TEXT,
ADD COLUMN     "country" TEXT NOT NULL DEFAULT 'AR',
ADD COLUMN     "cropId" TEXT,
ADD COLUMN     "loaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "document_chunks_pkey" PRIMARY KEY ("id");
