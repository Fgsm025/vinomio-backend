/*
  Warnings:

  - You are about to drop the column `completion_data` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `next_node_id` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `tasks` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "completion_data",
DROP COLUMN "next_node_id",
DROP COLUMN "order",
DROP COLUMN "type",
ADD COLUMN     "condition_answer" TEXT,
ADD COLUMN     "condition_options" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "crop_cycle_name" TEXT,
ADD COLUMN     "next_node_id_on_no" TEXT,
ADD COLUMN     "next_node_id_on_yes" TEXT,
ADD COLUMN     "plot_name" TEXT,
ADD COLUMN     "source_type" TEXT NOT NULL DEFAULT 'manual',
ADD COLUMN     "wait_days" INTEGER,
ADD COLUMN     "workflow_name" TEXT;
