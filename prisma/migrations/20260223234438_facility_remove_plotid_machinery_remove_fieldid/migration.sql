-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'ADMIN', 'FINANCE', 'AGRONOMIST', 'OPERATOR');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "avatar" TEXT,
    "google_id" TEXT,
    "has_completed_onboarding" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

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
    "field_id" TEXT,
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
    "farm_id" TEXT,
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
    "crop_destinations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "quality_regimes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "soil_coverage" TEXT,
    "integrated_production" BOOLEAN NOT NULL DEFAULT false,
    "reproduction_plant_material" TEXT,
    "type_detail" TEXT,
    "horizontal_planting_frame" DOUBLE PRECISION,
    "vertical_planting_frame" DOUBLE PRECISION,
    "between_rows" DOUBLE PRECISION,
    "on_row" DOUBLE PRECISION,
    "plant_density" DOUBLE PRECISION,
    "is_permanent_crop" BOOLEAN NOT NULL DEFAULT false,
    "image" JSONB,
    "scientific_name" TEXT,
    "lifespan" INTEGER,
    "harvest_type" TEXT,
    "estimated_yield_per_ha" DOUBLE PRECISION,
    "yield_unit" TEXT,
    "min_temperature" DOUBLE PRECISION,
    "max_temperature" DOUBLE PRECISION,
    "water_requirements" TEXT,
    "planting_days" INTEGER,
    "growing_days" INTEGER,
    "veraison_days" INTEGER,
    "maturation_days" INTEGER,
    "harvest_days" INTEGER,
    "post_harvest_days" INTEGER,
    "production_type" TEXT,
    "propagation_rooting_days" INTEGER,
    "propagation_pot_days" INTEGER,
    "propagation_sale_days" INTEGER,
    "cuttings_per_extraction" INTEGER,
    "extraction_frequency_days" INTEGER,
    "productive_years" INTEGER,
    "harvests_per_year" INTEGER,
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
    "farm_id" TEXT,
    "field_id" TEXT,
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
    "distance_to_farm" DOUBLE PRECISION,
    "field_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "water_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "water_consumptions" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "is_potable" BOOLEAN NOT NULL,
    "analysis_date" DATE NOT NULL,
    "file_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "water_consumptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "location" TEXT,
    "country" TEXT,
    "province" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "farm_size" DOUBLE PRECISION,
    "primary_production" TEXT,
    "irrigation_system" TEXT,
    "has_frost" BOOLEAN NOT NULL DEFAULT false,
    "frost_months" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "rainy_months" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "avg_temperature" TEXT,
    "last_frost_date" TEXT,
    "first_frost_date" TEXT,
    "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "working_hours_start" TEXT,
    "working_hours_end" TEXT,
    "harvest_days" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "growing_season_start" TEXT,
    "team_size" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_farms" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_farms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitations" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "invited_by_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "accepted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fields" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "farm_id" TEXT,
    "production_type" TEXT NOT NULL,
    "year_established" INTEGER,
    "primary_location" TEXT,
    "geometry" JSONB,
    "surface" DOUBLE PRECISION,
    "management_type" TEXT NOT NULL,
    "certification" TEXT,
    "tenure_regime" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "has_irrigation_system" BOOLEAN NOT NULL DEFAULT false,
    "responsible_manager" TEXT,
    "expected_annual_production" JSONB,
    "notes" TEXT,
    "description" TEXT,
    "sigpac_code" TEXT,
    "cadastral_reference" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plots" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sigpac_code" TEXT,
    "geometry" JSONB,
    "surface" DOUBLE PRECISION NOT NULL,
    "has_cadastral_reference" BOOLEAN NOT NULL DEFAULT false,
    "is_communal_pasture" BOOLEAN NOT NULL DEFAULT false,
    "is_pastures_common_in_common" BOOLEAN NOT NULL DEFAULT false,
    "tenure_regime" TEXT,
    "field_id" TEXT NOT NULL,
    "is_auto_generated" BOOLEAN NOT NULL DEFAULT false,
    "facility_building_ids" TEXT[],
    "soil_type" TEXT,
    "irrigation_system" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crop_cycles" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "crop_id" TEXT NOT NULL,
    "variety" TEXT,
    "plot_id" TEXT NOT NULL,
    "region" TEXT,
    "season" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'active',
    "planting_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "end_reason" TEXT,
    "planted_area" DOUBLE PRECISION,
    "plant_count" INTEGER,
    "plant_density" DOUBLE PRECISION,
    "current_status" TEXT NOT NULL,
    "phenology_template_id" TEXT,
    "manual_adjustments" JSONB,
    "stages" JSONB,
    "workflow_option" TEXT,
    "template_id" TEXT,
    "workflow_template_name" TEXT,
    "notes" TEXT,
    "seed_batch" TEXT,
    "nursery_origin" TEXT,
    "supplier" TEXT,
    "estimated_harvest_date" TIMESTAMP(3),
    "actual_harvest_start_date" TIMESTAMP(3),
    "actual_harvest_end_date" TIMESTAMP(3),
    "actual_yield" DOUBLE PRECISION,
    "yield_unit" TEXT,
    "previous_crop_id" TEXT,
    "next_planned_crop_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crop_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "livestock_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "animal_ids" TEXT[],
    "field_id" TEXT,
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
    "field_id" TEXT,
    "plot_id" TEXT,
    "color" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grazing_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "irrigation_schedules" (
    "id" TEXT NOT NULL,
    "schedule_name" TEXT NOT NULL,
    "field_id" TEXT,
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
CREATE TABLE "plot_on_irrigation_schedule" (
    "irrigation_schedule_id" TEXT NOT NULL,
    "plot_id" TEXT NOT NULL,

    CONSTRAINT "plot_on_irrigation_schedule_pkey" PRIMARY KEY ("irrigation_schedule_id","plot_id")
);

-- CreateTable
CREATE TABLE "rainfall_events" (
    "id" TEXT NOT NULL,
    "field_id" TEXT NOT NULL,
    "plot_id" TEXT,
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
    "farm_id" TEXT NOT NULL,
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
    "farm_id" TEXT NOT NULL,
    "field_id" TEXT,
    "plot_id" TEXT,
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
    "farm_id" TEXT NOT NULL,
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
    "farm_id" TEXT NOT NULL,
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
    "farm_id" TEXT NOT NULL,
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
    "farm_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflows" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "nodes" JSONB NOT NULL,
    "edges" JSONB NOT NULL,
    "is_template" BOOLEAN NOT NULL DEFAULT false,
    "farm_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'todo',
    "crop_cycle_id" TEXT,
    "workflow_id" TEXT,
    "workflow_name" TEXT,
    "crop_cycle_name" TEXT,
    "plot_name" TEXT,
    "node_id" TEXT,
    "node_type" TEXT,
    "node_data" JSONB,
    "condition_options" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "condition_answer" TEXT,
    "next_node_id_on_yes" TEXT,
    "next_node_id_on_no" TEXT,
    "wait_days" INTEGER,
    "source_type" TEXT NOT NULL DEFAULT 'manual',
    "stage_index" INTEGER,
    "assigned_to" TEXT,
    "due_date" TIMESTAMP(3),
    "priority" TEXT,
    "farm_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "farms_slug_key" ON "farms"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "user_farms_user_id_farm_id_key" ON "user_farms"("user_id", "farm_id");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_token_key" ON "invitations"("token");

-- CreateIndex
CREATE UNIQUE INDEX "stock_purchase_id_key" ON "stock"("purchase_id");

-- AddForeignKey
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "fields"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machinery" ADD CONSTRAINT "machinery_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animals" ADD CONSTRAINT "animals_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animals" ADD CONSTRAINT "animals_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "fields"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "water_sources" ADD CONSTRAINT "water_sources_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "fields"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "water_consumptions" ADD CONSTRAINT "water_consumptions_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_farms" ADD CONSTRAINT "user_farms_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_farms" ADD CONSTRAINT "user_farms_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invited_by_id_fkey" FOREIGN KEY ("invited_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fields" ADD CONSTRAINT "fields_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plots" ADD CONSTRAINT "plots_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "fields"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crop_cycles" ADD CONSTRAINT "crop_cycles_crop_id_fkey" FOREIGN KEY ("crop_id") REFERENCES "crops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crop_cycles" ADD CONSTRAINT "crop_cycles_plot_id_fkey" FOREIGN KEY ("plot_id") REFERENCES "plots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "livestock_groups" ADD CONSTRAINT "livestock_groups_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "fields"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grazing_locations" ADD CONSTRAINT "grazing_locations_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "fields"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grazing_locations" ADD CONSTRAINT "grazing_locations_plot_id_fkey" FOREIGN KEY ("plot_id") REFERENCES "plots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grazing_locations" ADD CONSTRAINT "grazing_locations_livestock_group_id_fkey" FOREIGN KEY ("livestock_group_id") REFERENCES "livestock_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "irrigation_schedules" ADD CONSTRAINT "irrigation_schedules_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "fields"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plot_on_irrigation_schedule" ADD CONSTRAINT "plot_on_irrigation_schedule_irrigation_schedule_id_fkey" FOREIGN KEY ("irrigation_schedule_id") REFERENCES "irrigation_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plot_on_irrigation_schedule" ADD CONSTRAINT "plot_on_irrigation_schedule_plot_id_fkey" FOREIGN KEY ("plot_id") REFERENCES "plots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rainfall_events" ADD CONSTRAINT "rainfall_events_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "fields"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rainfall_events" ADD CONSTRAINT "rainfall_events_plot_id_fkey" FOREIGN KEY ("plot_id") REFERENCES "plots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traceability_records" ADD CONSTRAINT "traceability_records_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traceability_records" ADD CONSTRAINT "traceability_records_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "fields"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traceability_records" ADD CONSTRAINT "traceability_records_plot_id_fkey" FOREIGN KEY ("plot_id") REFERENCES "plots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock" ADD CONSTRAINT "stock_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock" ADD CONSTRAINT "stock_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock" ADD CONSTRAINT "stock_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "purchases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflows" ADD CONSTRAINT "workflows_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_crop_cycle_id_fkey" FOREIGN KEY ("crop_cycle_id") REFERENCES "crop_cycles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflows"("id") ON DELETE SET NULL ON UPDATE CASCADE;
