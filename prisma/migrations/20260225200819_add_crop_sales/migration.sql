-- CreateTable
CREATE TABLE "crop_sales" (
    "id" TEXT NOT NULL,
    "crop_cycle_id" TEXT NOT NULL,
    "harvest_id" TEXT,
    "date" DATE NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'kg',
    "price" DOUBLE PRECISION,
    "buyer" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crop_sales_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "crop_sales" ADD CONSTRAINT "crop_sales_crop_cycle_id_fkey" FOREIGN KEY ("crop_cycle_id") REFERENCES "crop_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
