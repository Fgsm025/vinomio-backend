-- CreateEnum
CREATE TYPE "FarmMoneyDirection" AS ENUM ('INCOME', 'EXPENSE');

-- CreateTable
CREATE TABLE "farm_transactions" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "direction" "FarmMoneyDirection" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "occurred_at" DATE NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "field_id" TEXT,
    "source_kind" TEXT NOT NULL,
    "source_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farm_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "farm_transactions_farm_id_occurred_at_idx" ON "farm_transactions"("farm_id", "occurred_at");

-- Unique index: Prisma @@unique([sourceKind, sourceId]) — PostgreSQL allows multiple NULLs in source_id
CREATE UNIQUE INDEX "farm_transactions_source_kind_source_id_key" ON "farm_transactions"("source_kind", "source_id");

-- AddForeignKey
ALTER TABLE "farm_transactions" ADD CONSTRAINT "farm_transactions_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "farm_transactions" ADD CONSTRAINT "farm_transactions_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "fields"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill ledger rows from existing purchases (one row per purchase)
INSERT INTO "farm_transactions" (
  "id",
  "farm_id",
  "direction",
  "amount",
  "occurred_at",
  "category",
  "description",
  "field_id",
  "source_kind",
  "source_id",
  "created_at",
  "updated_at"
)
SELECT
  gen_random_uuid(),
  p."farm_id",
  'EXPENSE'::"FarmMoneyDirection",
  p."total",
  p."date",
  'Purchase',
  NULL,
  NULL,
  'purchase',
  p."id",
  p."created_at",
  NOW()
FROM "purchases" p
WHERE NOT EXISTS (
  SELECT 1 FROM "farm_transactions" ft
  WHERE ft."source_kind" = 'purchase' AND ft."source_id" = p."id"
);
