CREATE TABLE "payment_sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"wompi_payment_source_id" integer NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'AVAILABLE' NOT NULL,
	"card_brand" text,
	"card_last_four" text,
	"phone_number" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" serial PRIMARY KEY NOT NULL,
	"sku" text NOT NULL,
	"product_id" integer NOT NULL,
	"user_id" uuid NOT NULL,
	"size" varchar(50) NOT NULL,
	"color" varchar(50) NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"sold_count" integer DEFAULT 0 NOT NULL,
	"last_sold_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "product_variants" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"sku" text NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"price" numeric(12, 2) NOT NULL,
	"thumbnail" text,
	"brand" text NOT NULL,
	"category" text[] NOT NULL,
	"stock" integer DEFAULT 0,
	"sold_count" integer DEFAULT 0 NOT NULL,
	"last_sold_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "sale_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"sale_id" integer NOT NULL,
	"product_variant_id" integer,
	"product_id" integer,
	"quantity" integer NOT NULL,
	"unit_price" numeric(12, 2) NOT NULL,
	"line_total" numeric(12, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "sale_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "sales" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"status" varchar(32) DEFAULT 'paid' NOT NULL,
	"total_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "sales" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"plan" text DEFAULT 'gratis' NOT NULL,
	"status" text DEFAULT 'inactive' NOT NULL,
	"current_period_start" timestamp with time zone,
	"current_period_end" timestamp with time zone,
	"cancel_at_period_end" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"subscription_id" integer,
	"payment_source_id" integer,
	"wompi_transaction_id" text NOT NULL,
	"amount_in_cents" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'COP' NOT NULL,
	"status" text NOT NULL,
	"reference" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "transactions_wompi_transaction_id_unique" UNIQUE("wompi_transaction_id"),
	CONSTRAINT "transactions_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" text,
	"phone" varchar(256)
);
--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_product_variant_id_product_variants_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_payment_source_id_payment_sources_id_fk" FOREIGN KEY ("payment_source_id") REFERENCES "public"."payment_sources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_payment_sources_user_id" ON "payment_sources" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_payment_sources_user_wompi" ON "payment_sources" USING btree ("user_id","wompi_payment_source_id");--> statement-breakpoint
CREATE INDEX "idx_variants_product_id" ON "product_variants" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_variants_user_id" ON "product_variants" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_variants_user_sku" ON "product_variants" USING btree ("user_id","sku");--> statement-breakpoint
CREATE INDEX "idx_products_user_id" ON "products" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_products_created_at" ON "products" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_products_user_created" ON "products" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_products_user_sku" ON "products" USING btree ("user_id","sku");--> statement-breakpoint
CREATE INDEX "idx_sale_items_sale_id" ON "sale_items" USING btree ("sale_id");--> statement-breakpoint
CREATE INDEX "idx_sale_items_variant_id" ON "sale_items" USING btree ("product_variant_id");--> statement-breakpoint
CREATE INDEX "idx_sale_items_user_id" ON "sale_items" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_sale_items_product_id" ON "sale_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_sales_user_id" ON "sales" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_sales_created_at" ON "sales" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_user_id" ON "subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_status" ON "subscriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_transactions_user_id" ON "transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_transactions_subscription_id" ON "transactions" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "idx_transactions_status" ON "transactions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_transactions_created_at" ON "transactions" USING btree ("created_at");--> statement-breakpoint
CREATE POLICY "users_select_own_variants" ON "product_variants" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.uid()) = "product_variants"."user_id");--> statement-breakpoint
CREATE POLICY "users_insert_own_variants" ON "product_variants" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) = "product_variants"."user_id");--> statement-breakpoint
CREATE POLICY "users_update_own_variants" ON "product_variants" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.uid()) = "product_variants"."user_id") WITH CHECK ((select auth.uid()) = "product_variants"."user_id");--> statement-breakpoint
CREATE POLICY "users_delete_own_variants" ON "product_variants" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.uid()) = "product_variants"."user_id");--> statement-breakpoint
CREATE POLICY "users_select_own_products" ON "products" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.uid()) = "products"."user_id");--> statement-breakpoint
CREATE POLICY "users_insert_own_products" ON "products" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) = "products"."user_id");--> statement-breakpoint
CREATE POLICY "users_update_own_products" ON "products" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.uid()) = "products"."user_id") WITH CHECK ((select auth.uid()) = "products"."user_id");--> statement-breakpoint
CREATE POLICY "users_delete_own_products" ON "products" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.uid()) = "products"."user_id");--> statement-breakpoint
CREATE POLICY "users_select_own_sale_items" ON "sale_items" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.uid()) = "sale_items"."user_id");--> statement-breakpoint
CREATE POLICY "users_insert_own_sale_items" ON "sale_items" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) = "sale_items"."user_id");--> statement-breakpoint
CREATE POLICY "users_update_own_sale_items" ON "sale_items" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.uid()) = "sale_items"."user_id") WITH CHECK ((select auth.uid()) = "sale_items"."user_id");--> statement-breakpoint
CREATE POLICY "users_delete_own_sale_items" ON "sale_items" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.uid()) = "sale_items"."user_id");--> statement-breakpoint
CREATE POLICY "users_select_own_sales" ON "sales" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.uid()) = "sales"."user_id");--> statement-breakpoint
CREATE POLICY "users_insert_own_sales" ON "sales" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) = "sales"."user_id");--> statement-breakpoint
CREATE POLICY "users_update_own_sales" ON "sales" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.uid()) = "sales"."user_id") WITH CHECK ((select auth.uid()) = "sales"."user_id");--> statement-breakpoint
CREATE POLICY "users_delete_own_sales" ON "sales" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.uid()) = "sales"."user_id");