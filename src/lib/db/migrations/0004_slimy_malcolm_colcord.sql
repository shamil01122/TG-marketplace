ALTER TABLE "rum_deals" ADD COLUMN "expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "rum_deals" ADD COLUMN "paid_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "rum_deals" ADD COLUMN "completed_at" timestamp with time zone;