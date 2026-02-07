-- CreateTable
CREATE TABLE "crops" (
    "id" TEXT NOT NULL,
    "product" TEXT NOT NULL,
    "variety" TEXT,
    "name_or_description" TEXT,
    "exploitation_system" TEXT,
    "agricultural_activity" TEXT,
    "crop_system" TEXT,
    "ecological_production_certificate" TEXT,
    "crop_destination" TEXT,
    "soil_coverage" TEXT,
    "integrated_production" BOOLEAN NOT NULL DEFAULT false,
    "reproduction_plant_material" TEXT,
    "type_detail" TEXT,
    "horizontal_planting_frame" DOUBLE PRECISION,
    "vertical_planting_frame" DOUBLE PRECISION,
    "plant_density" DOUBLE PRECISION,
    "is_permanent_crop" BOOLEAN NOT NULL DEFAULT false,
    "quality_regimes" TEXT[],
    "image" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "animals" (
    "id" TEXT NOT NULL,
    "name_label" TEXT NOT NULL,
    "animal_type" TEXT NOT NULL,
    "breed" TEXT,
    "sex" TEXT NOT NULL,
    "labels_keywords" TEXT,
    "internal_id" TEXT,
    "status" TEXT NOT NULL,
    "neutered" BOOLEAN NOT NULL DEFAULT false,
    "is_breeding_stock" BOOLEAN NOT NULL DEFAULT false,
    "coloring" TEXT,
    "retention_score" DOUBLE PRECISION,
    "description" TEXT,
    "birth_date" TIMESTAMP(3),
    "dam" TEXT,
    "sire" TEXT,
    "birth_weight" DOUBLE PRECISION,
    "age_to_wean" INTEGER,
    "date_weaned" TIMESTAMP(3),
    "raised_or_purchased" TEXT,
    "veterinarian" TEXT,
    "on_feed" BOOLEAN NOT NULL DEFAULT false,
    "feed_type" TEXT,
    "measure_harvests_in" TEXT,
    "estimated_revenue" DOUBLE PRECISION,
    "estimated_value" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "animals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "water_sources" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "distance_to_exploitation" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "water_sources_pkey" PRIMARY KEY ("id")
);
