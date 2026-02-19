/*
  Warnings:

  - You are about to drop the column `color` on the `fields` table. All the data in the column will be lost.
  - You are about to drop the column `color` on the `plots` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "fields" DROP COLUMN "color";

-- AlterTable
ALTER TABLE "plots" DROP COLUMN "color";

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'todo',
    "type" TEXT NOT NULL DEFAULT 'manual',
    "crop_cycle_id" TEXT,
    "workflow_id" TEXT,
    "node_id" TEXT,
    "stage_index" INTEGER,
    "node_type" TEXT,
    "node_data" JSONB,
    "completion_data" JSONB,
    "next_node_id" TEXT,
    "assigned_to" TEXT,
    "due_date" TIMESTAMP(3),
    "order" INTEGER NOT NULL DEFAULT 0,
    "farm_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
