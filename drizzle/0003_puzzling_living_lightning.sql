CREATE TABLE "leadSubmissions" (
	"id" text PRIMARY KEY NOT NULL,
	"pageId" text NOT NULL,
	"slug" text NOT NULL,
	"variantId" text NOT NULL,
	"elementId" text NOT NULL,
	"formVariant" text NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"message" text,
	"deliveryTarget" text NOT NULL,
	"deliveryStatus" text NOT NULL,
	"deliveryHttpStatus" integer,
	"webhookUrl" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "leadSubmissions" ADD CONSTRAINT "leadSubmissions_pageId_pages_id_fk" FOREIGN KEY ("pageId") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "lead_submissions_page_variant_idx" ON "leadSubmissions" USING btree ("pageId","variantId");
--> statement-breakpoint
CREATE INDEX "lead_submissions_slug_created_at_idx" ON "leadSubmissions" USING btree ("slug","createdAt");
