-- Keep timezone-aware columns aligned with current Prisma schema.
ALTER TABLE "public"."AvailabilityDay"
  ADD COLUMN IF NOT EXISTS "timesUTC" JSONB,
  ADD COLUMN IF NOT EXISTS "timezone" TEXT;

-- Merge duplicate date/adminEmail rows (previously split by program) before applying the new unique key.
WITH grouped AS (
  SELECT
    expanded."date",
    expanded."adminEmail",
    MIN(expanded.id) AS keep_id,
    COALESCE(jsonb_agg(DISTINCT expanded.slot) FILTER (WHERE expanded.slot IS NOT NULL), '[]'::jsonb) AS merged_times
  FROM (
    SELECT
      a.id,
      a."date",
      a."adminEmail",
      slots.slot
    FROM "public"."AvailabilityDay" a
    LEFT JOIN LATERAL jsonb_array_elements_text(
      CASE
        WHEN jsonb_typeof(a."times"::jsonb) = 'array' THEN a."times"::jsonb
        ELSE '[]'::jsonb
      END
    ) AS slots(slot) ON true
  ) AS expanded
  GROUP BY expanded."date", expanded."adminEmail"
),
updated AS (
  UPDATE "public"."AvailabilityDay" AS a
  SET "times" = grouped.merged_times
  FROM grouped
  WHERE a.id = grouped.keep_id
  RETURNING a.id
)
DELETE FROM "public"."AvailabilityDay" AS a
USING grouped
WHERE a."date" = grouped."date"
  AND a."adminEmail" = grouped."adminEmail"
  AND a.id <> grouped.keep_id;

-- Replace old uniqueness model with the new one.
DROP INDEX IF EXISTS "public"."AvailabilityDay_date_program_adminEmail_key";
ALTER TABLE "public"."AvailabilityDay" DROP COLUMN IF EXISTS "program";
CREATE UNIQUE INDEX IF NOT EXISTS "AvailabilityDay_date_adminEmail_key" ON "public"."AvailabilityDay"("date", "adminEmail");
