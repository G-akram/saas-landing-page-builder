CREATE TABLE "publishedPageEvents" (
	"id" text PRIMARY KEY NOT NULL,
	"pageId" text NOT NULL,
	"variantId" text NOT NULL,
	"assignmentId" text NOT NULL,
	"contentHash" text NOT NULL,
	"eventType" text NOT NULL,
	"goalElementId" text,
	"occurredAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "publishedPages" DROP CONSTRAINT "publishedPages_pageId_unique";--> statement-breakpoint
ALTER TABLE "publishedPages" DROP CONSTRAINT "publishedPages_slug_unique";--> statement-breakpoint
ALTER TABLE "publishedPages" ALTER COLUMN "variantId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "publishedPageEvents" ADD CONSTRAINT "publishedPageEvents_pageId_pages_id_fk" FOREIGN KEY ("pageId") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "published_page_events_assignment_event_unique" ON "publishedPageEvents" USING btree ("assignmentId","eventType");--> statement-breakpoint
CREATE INDEX "published_page_events_page_variant_idx" ON "publishedPageEvents" USING btree ("pageId","variantId");--> statement-breakpoint
CREATE INDEX "published_page_events_occurred_at_idx" ON "publishedPageEvents" USING btree ("occurredAt");--> statement-breakpoint
CREATE UNIQUE INDEX "published_pages_page_variant_unique" ON "publishedPages" USING btree ("pageId","variantId");--> statement-breakpoint
CREATE INDEX "published_pages_slug_idx" ON "publishedPages" USING btree ("slug");