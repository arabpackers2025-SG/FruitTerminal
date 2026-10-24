CREATE TYPE "public"."claim_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."company_role" AS ENUM('BUYER', 'SELLER', 'BOTH');--> statement-breakpoint
CREATE TYPE "public"."company_status" AS ENUM('UNCLAIMED', 'CLAIMED', 'VERIFIED');--> statement-breakpoint
CREATE TYPE "public"."direction" AS ENUM('SELLS', 'BUYS');--> statement-breakpoint
CREATE TYPE "public"."lead_status" AS ENUM('ACTIVE', 'CLOSED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."plan" AS ENUM('FREE', 'SELLER_PRO', 'BUYER_PRO');--> statement-breakpoint
CREATE TYPE "public"."review_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('ACTIVE', 'PAST_DUE', 'CANCELED');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('OWNER', 'STAFF', 'ADMIN');--> statement-breakpoint
CREATE TABLE "buy_requests" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
	"company_id" text NOT NULL,
	"category_id" text NOT NULL,
	"title" text NOT NULL,
	"quantity" text,
	"destination" text,
	"needed_by" timestamp with time zone,
	"details" text,
	"status" "lead_status" DEFAULT 'ACTIVE' NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "claim_requests" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
	"company_id" text NOT NULL,
	"user_id" text NOT NULL,
	"proof" text,
	"status" "claim_status" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"role" "company_role" DEFAULT 'BUYER' NOT NULL,
	"country" text NOT NULL,
	"city" text,
	"address" text,
	"website" text,
	"phone" text,
	"email" text,
	"logo_url" text,
	"description" text,
	"stall" text,
	"status" "company_status" DEFAULT 'UNCLAIMED' NOT NULL,
	"source" text,
	"source_url" text,
	"scraped_at" timestamp with time zone,
	"terminal_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "companies_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "company_products" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
	"company_id" text NOT NULL,
	"category_id" text NOT NULL,
	"direction" "direction" NOT NULL,
	"season_from" integer,
	"season_to" integer
);
--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
	"from_company_id" text NOT NULL,
	"to_company_id" text NOT NULL,
	"offer_id" text,
	"request_id" text,
	"message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "offers" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
	"company_id" text NOT NULL,
	"category_id" text NOT NULL,
	"title" text NOT NULL,
	"quantity" text,
	"origin" text,
	"available_from" timestamp with time zone,
	"available_to" timestamp with time zone,
	"price_terms" text,
	"details" text,
	"status" "lead_status" DEFAULT 'ACTIVE' NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_categories" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"parent_id" text,
	CONSTRAINT "product_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
	"company_id" text NOT NULL,
	"photos" text[] DEFAULT '{}'::text[] NOT NULL,
	"certifications" text[] DEFAULT '{}'::text[] NOT NULL,
	"packing_details" text,
	"export_markets" text[] DEFAULT '{}'::text[] NOT NULL,
	"capacity" text,
	"year_founded" integer,
	"employees" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_company_id_unique" UNIQUE("company_id")
);
--> statement-breakpoint
CREATE TABLE "staging_companies" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
	"name" text NOT NULL,
	"website" text,
	"phone" text,
	"email" text,
	"address" text,
	"stall" text,
	"products" text,
	"country" text,
	"city" text,
	"terminal_slug" text,
	"source" text NOT NULL,
	"source_url" text,
	"raw" jsonb,
	"review" "review_status" DEFAULT 'PENDING' NOT NULL,
	"scraped_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
	"company_id" text NOT NULL,
	"plan" "plan" DEFAULT 'FREE' NOT NULL,
	"status" "subscription_status" DEFAULT 'ACTIVE' NOT NULL,
	"period_end" timestamp with time zone,
	"stripe_customer_id" text,
	"stripe_sub_id" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_company_id_unique" UNIQUE("company_id")
);
--> statement-breakpoint
CREATE TABLE "terminals" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"city" text NOT NULL,
	"region" text,
	"country" text NOT NULL,
	"address" text,
	"lat" double precision,
	"lng" double precision,
	"hours" text,
	"website" text,
	"phone" text,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "terminals_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text,
	"name" text,
	"role" "user_role" DEFAULT 'OWNER' NOT NULL,
	"company_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "buy_requests" ADD CONSTRAINT "buy_requests_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buy_requests" ADD CONSTRAINT "buy_requests_category_id_product_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claim_requests" ADD CONSTRAINT "claim_requests_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claim_requests" ADD CONSTRAINT "claim_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_terminal_id_terminals_id_fk" FOREIGN KEY ("terminal_id") REFERENCES "public"."terminals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_products" ADD CONSTRAINT "company_products_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_products" ADD CONSTRAINT "company_products_category_id_product_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_from_company_id_companies_id_fk" FOREIGN KEY ("from_company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_to_company_id_companies_id_fk" FOREIGN KEY ("to_company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_request_id_buy_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."buy_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_category_id_product_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "buy_requests_category_status_idx" ON "buy_requests" USING btree ("category_id","status");--> statement-breakpoint
CREATE INDEX "companies_country_idx" ON "companies" USING btree ("country");--> statement-breakpoint
CREATE INDEX "companies_role_idx" ON "companies" USING btree ("role");--> statement-breakpoint
CREATE INDEX "companies_terminal_idx" ON "companies" USING btree ("terminal_id");--> statement-breakpoint
CREATE INDEX "companies_name_idx" ON "companies" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "company_products_unique" ON "company_products" USING btree ("company_id","category_id","direction");--> statement-breakpoint
CREATE INDEX "company_products_category_idx" ON "company_products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "inquiries_from_created_idx" ON "inquiries" USING btree ("from_company_id","created_at");--> statement-breakpoint
CREATE INDEX "inquiries_to_idx" ON "inquiries" USING btree ("to_company_id");--> statement-breakpoint
CREATE INDEX "offers_category_status_idx" ON "offers" USING btree ("category_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "staging_source_name_unique" ON "staging_companies" USING btree ("source","name");--> statement-breakpoint
CREATE INDEX "terminals_country_idx" ON "terminals" USING btree ("country");