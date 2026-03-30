ALTER TABLE "publishedPages" ADD COLUMN "trafficWeight" integer;--> statement-breakpoint
ALTER TABLE "publishedPages" ADD COLUMN "primaryGoalElementId" text;--> statement-breakpoint
UPDATE "publishedPages" AS "publishedPage"
SET
	"trafficWeight" = ("variant"."value" ->> 'trafficWeight')::integer,
	"primaryGoalElementId" = "variant"."value" -> 'primaryGoal' ->> 'elementId'
FROM "pages" AS "page"
CROSS JOIN LATERAL jsonb_array_elements(COALESCE("page"."document" -> 'variants', '[]'::jsonb)) AS "variant"("value")
WHERE "page"."id" = "publishedPage"."pageId"
	AND "variant"."value" ->> 'id' = "publishedPage"."variantId";--> statement-breakpoint
UPDATE "publishedPages"
SET "trafficWeight" = 100
WHERE "trafficWeight" IS NULL;--> statement-breakpoint
ALTER TABLE "publishedPages" ALTER COLUMN "trafficWeight" SET NOT NULL;
