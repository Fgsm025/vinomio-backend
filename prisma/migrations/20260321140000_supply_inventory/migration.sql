-- Extend inventory items and rename `products` -> `supplies`

ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "minimum_stock" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'active';
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "use_supplier_product" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "supplier_id" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "supplier_product_id" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "stock_origin" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "purchase_date" DATE;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "purchase_cost" DOUBLE PRECISION;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "sale_price" DOUBLE PRECISION;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "price_regular" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "price_discounted" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "vendor" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "sku" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "barcode" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "published_at" TIMESTAMP(3);
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "warehouse_id" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "expiry_date" DATE;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "stock_quantity" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_supplier_id_fkey";
ALTER TABLE "products" ADD CONSTRAINT "products_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "products" RENAME TO "supplies";
ALTER INDEX "products_pkey" RENAME TO "supplies_pkey";
ALTER TABLE "supplies" RENAME CONSTRAINT "products_farm_id_fkey" TO "supplies_farm_id_fkey";
ALTER TABLE "supplies" RENAME CONSTRAINT "products_supplier_id_fkey" TO "supplies_supplier_id_fkey";
