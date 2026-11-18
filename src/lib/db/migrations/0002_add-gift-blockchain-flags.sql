ALTER TABLE "rum_gifts" ADD COLUMN "is_burned" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "rum_gifts" ADD COLUMN "is_from_blockchain" boolean DEFAULT false NOT NULL;