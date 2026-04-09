-- pgvector HNSW index for cosine distance (<=>). Prisma cannot declare this on Unsupported("vector").
-- Recreate manually if dropped; use CONCURRENTLY in production if the table is large (run outside Prisma transaction).
CREATE INDEX IF NOT EXISTS "document_chunks_embedding_hnsw_idx" ON "document_chunks" USING hnsw ("embedding" vector_cosine_ops);
