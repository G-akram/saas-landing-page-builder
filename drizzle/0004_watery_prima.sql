CREATE TABLE "creditBalances" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creditBalances_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "creditTransactions" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"amount" integer NOT NULL,
	"reason" text NOT NULL,
	"stripePaymentIntentId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
CREATE TABLE "rateLimitEvents" (
	"id" text PRIMARY KEY NOT NULL,
	"scope" text NOT NULL,
	"key" text NOT NULL,
	"occurredAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stripeEvents" (
	"id" text PRIMARY KEY NOT NULL,
	"eventType" text NOT NULL,
	"processedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"stripeCustomerId" text NOT NULL,
	"stripeSubscriptionId" text,
	"stripePriceId" text,
	"status" text DEFAULT 'free' NOT NULL,
	"currentPeriodStart" timestamp,
	"currentPeriodEnd" timestamp,
	"cancelAtPeriodEnd" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_userId_unique" UNIQUE("userId"),
	CONSTRAINT "subscriptions_stripeCustomerId_unique" UNIQUE("stripeCustomerId")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "passwordHash" text;--> statement-breakpoint
ALTER TABLE "creditBalances" ADD CONSTRAINT "creditBalances_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creditTransactions" ADD CONSTRAINT "creditTransactions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leadSubmissions" ADD CONSTRAINT "leadSubmissions_pageId_pages_id_fk" FOREIGN KEY ("pageId") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "credit_transactions_user_created_at_idx" ON "creditTransactions" USING btree ("userId","createdAt");--> statement-breakpoint
CREATE INDEX "lead_submissions_page_variant_idx" ON "leadSubmissions" USING btree ("pageId","variantId");--> statement-breakpoint
CREATE INDEX "lead_submissions_slug_created_at_idx" ON "leadSubmissions" USING btree ("slug","createdAt");--> statement-breakpoint
CREATE INDEX "rate_limit_events_scope_key_occurred_at_idx" ON "rateLimitEvents" USING btree ("scope","key","occurredAt");--> statement-breakpoint
CREATE INDEX "rate_limit_events_occurred_at_idx" ON "rateLimitEvents" USING btree ("occurredAt");--> statement-breakpoint
CREATE INDEX "subscriptions_stripe_customer_id_idx" ON "subscriptions" USING btree ("stripeCustomerId");--> statement-breakpoint
CREATE INDEX "subscriptions_stripe_subscription_id_idx" ON "subscriptions" USING btree ("stripeSubscriptionId");