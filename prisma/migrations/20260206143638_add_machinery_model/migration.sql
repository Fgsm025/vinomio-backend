-- CreateTable
CREATE TABLE "machinery" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "brand" TEXT,
    "model" TEXT,
    "serial_number" TEXT,
    "year" INTEGER,
    "description" TEXT,
    "status" TEXT,
    "is_registered_in_roma" BOOLEAN NOT NULL DEFAULT false,
    "identifier" TEXT,
    "plate_number" TEXT,
    "registration_number" TEXT,
    "is_property_ownership" BOOLEAN NOT NULL DEFAULT false,
    "acquisition_date" TIMESTAMP(3),
    "purchase_price" DOUBLE PRECISION,
    "current_value" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "machinery_pkey" PRIMARY KEY ("id")
);
