-- CreateTable
CREATE TABLE "facilities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "class" TEXT,
    "cadastral_reference" TEXT,
    "year_of_construction" INTEGER,
    "surface" DOUBLE PRECISION,
    "units" INTEGER,
    "maximum_storage" DOUBLE PRECISION,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "tenure_regime" TEXT,
    "production_unit_id" TEXT,
    "sector_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facilities_pkey" PRIMARY KEY ("id")
);

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
    "production_unit_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "machinery_pkey" PRIMARY KEY ("id")
);

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
    "production_unit_id" TEXT,
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
    "production_unit_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "water_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exploitations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "country" TEXT,
    "province" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exploitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_units" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "exploitation_id" TEXT,
    "production_type" TEXT NOT NULL,
    "crop_category" TEXT,
    "specific_variety" TEXT,
    "year_established" INTEGER,
    "total_area" DOUBLE PRECISION,
    "associated_sectors" TEXT[],
    "primary_location" TEXT,
    "management_type" TEXT NOT NULL,
    "certification" TEXT,
    "tenure_regime" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "has_irrigation_system" BOOLEAN NOT NULL DEFAULT false,
    "responsible_manager" TEXT,
    "expected_annual_production" JSONB,
    "notes" TEXT,
    "color" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sectors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sigpac_code" TEXT,
    "surface" DOUBLE PRECISION,
    "has_cadastral_reference" BOOLEAN NOT NULL DEFAULT false,
    "is_communal_pasture" BOOLEAN NOT NULL DEFAULT false,
    "is_pastures_common_in_common" BOOLEAN NOT NULL DEFAULT false,
    "tenure_regime" TEXT,
    "production_unit_id" TEXT,
    "color" TEXT,
    "facility_building_ids" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sectors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crop_cycles" (
    "id" TEXT NOT NULL,
    "crop_id" TEXT NOT NULL,
    "variety" TEXT,
    "production_unit_id" TEXT,
    "sector_id" TEXT NOT NULL,
    "region" TEXT,
    "planting_date" TIMESTAMP(3) NOT NULL,
    "planted_area" DOUBLE PRECISION,
    "plant_count" INTEGER,
    "plant_density" DOUBLE PRECISION,
    "current_status" TEXT NOT NULL,
    "phenology_template_id" TEXT,
    "manual_adjustments" JSONB,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crop_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "livestock_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "animal_ids" TEXT[],
    "production_unit_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "livestock_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grazing_locations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "polygon_id" TEXT,
    "livestock_group_id" TEXT,
    "animal_count" INTEGER,
    "surface" DOUBLE PRECISION NOT NULL,
    "entry_date" TIMESTAMP(3),
    "days_in_location" INTEGER,
    "animal_days_per_acre" DOUBLE PRECISION,
    "sector_id" TEXT NOT NULL,
    "color" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grazing_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "irrigation_schedules" (
    "id" TEXT NOT NULL,
    "schedule_name" TEXT NOT NULL,
    "production_unit_id" TEXT,
    "field_name" TEXT,
    "lot_name" TEXT,
    "crop_type" TEXT,
    "irrigation_method" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "frequency" TEXT,
    "duration" INTEGER,
    "water_volume" DOUBLE PRECISION,
    "next_scheduled_date" TIMESTAMP(3),
    "last_executed_date" TIMESTAMP(3),
    "start_time" TEXT,
    "end_time" TEXT,
    "days_of_week" TEXT[],
    "soil_moisture_threshold" DOUBLE PRECISION,
    "weather_dependent" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "irrigation_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sector_on_irrigation_schedule" (
    "irrigation_schedule_id" TEXT NOT NULL,
    "sector_id" TEXT NOT NULL,

    CONSTRAINT "sector_on_irrigation_schedule_pkey" PRIMARY KEY ("irrigation_schedule_id","sector_id")
);

-- CreateTable
CREATE TABLE "rainfall_events" (
    "id" TEXT NOT NULL,
    "production_unit_id" TEXT NOT NULL,
    "sector_id" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "amount_mm" DOUBLE PRECISION,
    "intensity" TEXT,
    "source" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rainfall_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "exploitation_id" TEXT NOT NULL,
    "role" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "start_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "traceability_records" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "lot_number" TEXT NOT NULL,
    "exploitation_id" TEXT NOT NULL,
    "production_unit_id" TEXT,
    "sector_id" TEXT,
    "application_date" TIMESTAMP(3) NOT NULL,
    "applied_by" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "traceability_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "unit" TEXT DEFAULT 'unit',
    "description" TEXT,
    "exploitation_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "exploitation_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "location_id" TEXT,
    "date" DATE NOT NULL,
    "type" TEXT NOT NULL,
    "exploitation_id" TEXT NOT NULL,
    "purchase_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchases" (
    "id" TEXT NOT NULL,
    "supplier_id" TEXT NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    "date" DATE NOT NULL,
    "exploitation_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stock_purchase_id_key" ON "stock"("purchase_id");

-- AddForeignKey
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_production_unit_id_fkey" FOREIGN KEY ("production_unit_id") REFERENCES "production_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machinery" ADD CONSTRAINT "machinery_production_unit_id_fkey" FOREIGN KEY ("production_unit_id") REFERENCES "production_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animals" ADD CONSTRAINT "animals_production_unit_id_fkey" FOREIGN KEY ("production_unit_id") REFERENCES "production_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "water_sources" ADD CONSTRAINT "water_sources_production_unit_id_fkey" FOREIGN KEY ("production_unit_id") REFERENCES "production_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_units" ADD CONSTRAINT "production_units_exploitation_id_fkey" FOREIGN KEY ("exploitation_id") REFERENCES "exploitations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sectors" ADD CONSTRAINT "sectors_production_unit_id_fkey" FOREIGN KEY ("production_unit_id") REFERENCES "production_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crop_cycles" ADD CONSTRAINT "crop_cycles_crop_id_fkey" FOREIGN KEY ("crop_id") REFERENCES "crops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crop_cycles" ADD CONSTRAINT "crop_cycles_production_unit_id_fkey" FOREIGN KEY ("production_unit_id") REFERENCES "production_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crop_cycles" ADD CONSTRAINT "crop_cycles_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "livestock_groups" ADD CONSTRAINT "livestock_groups_production_unit_id_fkey" FOREIGN KEY ("production_unit_id") REFERENCES "production_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grazing_locations" ADD CONSTRAINT "grazing_locations_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grazing_locations" ADD CONSTRAINT "grazing_locations_livestock_group_id_fkey" FOREIGN KEY ("livestock_group_id") REFERENCES "livestock_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "irrigation_schedules" ADD CONSTRAINT "irrigation_schedules_production_unit_id_fkey" FOREIGN KEY ("production_unit_id") REFERENCES "production_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sector_on_irrigation_schedule" ADD CONSTRAINT "sector_on_irrigation_schedule_irrigation_schedule_id_fkey" FOREIGN KEY ("irrigation_schedule_id") REFERENCES "irrigation_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sector_on_irrigation_schedule" ADD CONSTRAINT "sector_on_irrigation_schedule_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rainfall_events" ADD CONSTRAINT "rainfall_events_production_unit_id_fkey" FOREIGN KEY ("production_unit_id") REFERENCES "production_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rainfall_events" ADD CONSTRAINT "rainfall_events_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_exploitation_id_fkey" FOREIGN KEY ("exploitation_id") REFERENCES "exploitations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traceability_records" ADD CONSTRAINT "traceability_records_exploitation_id_fkey" FOREIGN KEY ("exploitation_id") REFERENCES "exploitations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traceability_records" ADD CONSTRAINT "traceability_records_production_unit_id_fkey" FOREIGN KEY ("production_unit_id") REFERENCES "production_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traceability_records" ADD CONSTRAINT "traceability_records_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_exploitation_id_fkey" FOREIGN KEY ("exploitation_id") REFERENCES "exploitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_exploitation_id_fkey" FOREIGN KEY ("exploitation_id") REFERENCES "exploitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock" ADD CONSTRAINT "stock_exploitation_id_fkey" FOREIGN KEY ("exploitation_id") REFERENCES "exploitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock" ADD CONSTRAINT "stock_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock" ADD CONSTRAINT "stock_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "purchases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_exploitation_id_fkey" FOREIGN KEY ("exploitation_id") REFERENCES "exploitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
