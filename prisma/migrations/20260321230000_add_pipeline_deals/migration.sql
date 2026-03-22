-- CreateTable
CREATE TABLE "pipeline_deals" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "quantity" DOUBLE PRECISION,
    "product_id" TEXT,
    "priority" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "client_id" TEXT,
    "create_date" TIMESTAMP(3) NOT NULL,
    "close_date" TIMESTAMP(3) NOT NULL,
    "last_update" TIMESTAMP(3) NOT NULL,
    "owner" JSONB NOT NULL,
    "client" JSONB NOT NULL,
    "company" JSONB NOT NULL,
    "collaborators" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pipeline_deals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pipeline_deals_farm_id_stage_idx" ON "pipeline_deals"("farm_id", "stage");

-- AddForeignKey
ALTER TABLE "pipeline_deals" ADD CONSTRAINT "pipeline_deals_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pipeline_deals" ADD CONSTRAINT "pipeline_deals_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
