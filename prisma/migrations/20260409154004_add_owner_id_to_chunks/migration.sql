-- AlterTable
ALTER TABLE "document_chunks" ADD COLUMN     "owner_id" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "document_count" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "document_chunks_owner_id_idx" ON "document_chunks"("owner_id");

-- AddForeignKey
ALTER TABLE "document_chunks" ADD CONSTRAINT "document_chunks_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
