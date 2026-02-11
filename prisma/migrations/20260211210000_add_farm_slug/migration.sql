ALTER TABLE "farms" ADD COLUMN "slug" TEXT;

UPDATE "farms" SET "slug" = lower(regexp_replace(regexp_replace(trim("name"), '\s+', '-', 'g'), '[^a-z0-9-]', '', 'g'));
UPDATE "farms" SET "slug" = regexp_replace(COALESCE("slug", ''), '-+', '-', 'g');
UPDATE "farms" SET "slug" = regexp_replace("slug", '^-|-$', '', 'g');
UPDATE "farms" SET "slug" = CASE WHEN "slug" = '' OR "slug" IS NULL THEN 'farm' ELSE "slug" END;

WITH dups AS (
  SELECT id, slug, row_number() OVER (PARTITION BY slug ORDER BY "created_at") AS rn
  FROM farms
)
UPDATE farms f SET slug = f.slug || '-' || substring(f.id from 1 for 8)
FROM dups d WHERE f.id = d.id AND d.rn > 1;

ALTER TABLE "farms" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "farms_slug_key" ON "farms"("slug");
