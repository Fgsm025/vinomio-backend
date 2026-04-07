CREATE EXTENSION IF NOT EXISTS vector;

-- CreateTable
CREATE TABLE "document_chunks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "content" TEXT NOT NULL,
    "embedding" vector(1536) NOT NULL,
    "source" TEXT,
    "categoria" TEXT,
    "cultivo_id" TEXT,
    "pais" TEXT NOT NULL DEFAULT 'AR',
    "fecha_validez" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "document_chunks_pkey" PRIMARY KEY ("id")
);
