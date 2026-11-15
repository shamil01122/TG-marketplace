CREATE TYPE "public"."rum_deal_status" AS ENUM('pending', 'payment_pending', 'paid', 'transferring', 'completed', 'cancelled', 'disputed');--> statement-breakpoint
CREATE TYPE "public"."rum_gift_status" AS ENUM('available', 'listed', 'reserved', 'sold');--> statement-breakpoint
CREATE TYPE "public"."rum_listing_status" AS ENUM('active', 'reserved', 'sold', 'cancelled');--> statement-breakpoint
CREATE TABLE "rum_deals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"buyer_id" uuid NOT NULL,
	"seller_id" uuid NOT NULL,
	"amount_ton" numeric(20, 9) NOT NULL,
	"status" "rum_deal_status" DEFAULT 'pending' NOT NULL,
	"transaction_hash" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rum_gifts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"telegram_gift_id" text NOT NULL,
	"name" text NOT NULL,
	"collection" text DEFAULT '' NOT NULL,
	"model" text DEFAULT '' NOT NULL,
	"backdrop" text DEFAULT '' NOT NULL,
	"symbol" text DEFAULT '' NOT NULL,
	"image_url" text DEFAULT '' NOT NULL,
	"owner_id" uuid,
	"status" "rum_gift_status" DEFAULT 'available' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "rum_gifts_telegram_gift_id_unique" UNIQUE("telegram_gift_id")
);
--> statement-breakpoint
CREATE TABLE "rum_listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gift_id" uuid NOT NULL,
	"seller_id" uuid NOT NULL,
	"price_ton" numeric(20, 9) NOT NULL,
	"status" "rum_listing_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rum_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"telegram_user_id" bigint NOT NULL,
	"username" text DEFAULT '' NOT NULL,
	"display_name" text DEFAULT '' NOT NULL,
	"avatar_url" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "rum_profiles_telegram_user_id_unique" UNIQUE("telegram_user_id")
);
--> statement-breakpoint
ALTER TABLE "rum_deals" ADD CONSTRAINT "rum_deals_listing_id_rum_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."rum_listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rum_deals" ADD CONSTRAINT "rum_deals_buyer_id_rum_profiles_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."rum_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rum_deals" ADD CONSTRAINT "rum_deals_seller_id_rum_profiles_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."rum_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rum_gifts" ADD CONSTRAINT "rum_gifts_owner_id_rum_profiles_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."rum_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rum_listings" ADD CONSTRAINT "rum_listings_gift_id_rum_gifts_id_fk" FOREIGN KEY ("gift_id") REFERENCES "public"."rum_gifts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rum_listings" ADD CONSTRAINT "rum_listings_seller_id_rum_profiles_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."rum_profiles"("id") ON DELETE no action ON UPDATE no action;