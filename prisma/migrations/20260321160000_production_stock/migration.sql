-- CreateEnum
CREATE TYPE "ProductionStockKind" AS ENUM ('HARVEST', 'BYPRODUCT');

-- CreateTable
CREATE TABLE "production_stock" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "kind" "ProductionStockKind" NOT NULL,
    "crop_id" TEXT,
    "crop_cycle_id" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',
    "unit" TEXT NOT NULL,
    "min_stock_level" DOUBLE PRECISION,
    "harvest_date" DATE,
    "expiry_date" DATE,
    "name" TEXT,
    "category" TEXT,
    "production_date" DATE,
    "field_id" TEXT,
    "plot_ids" JSONB,
    "warehouse_id" TEXT,
    "sale_price" DOUBLE PRECISION,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_stock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "production_stock_crop_cycle_id_key" ON "production_stock"("crop_cycle_id");

-- CreateIndex
CREATE INDEX "production_stock_farm_id_kind_idx" ON "production_stock"("farm_id", "kind");

-- AddForeignKey
ALTER TABLE "production_stock" ADD CONSTRAINT "production_stock_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "production_stock" ADD CONSTRAINT "production_stock_crop_id_fkey" FOREIGN KEY ("crop_id") REFERENCES "crops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "production_stock" ADD CONSTRAINT "production_stock_crop_cycle_id_fkey" FOREIGN KEY ("crop_cycle_id") REFERENCES "crop_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
