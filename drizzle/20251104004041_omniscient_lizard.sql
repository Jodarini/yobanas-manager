CREATE TABLE "sale_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"sale_id" integer NOT NULL,
	"product_variant_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(12, 2) NOT NULL,
	"line_total" numeric(12, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sale_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "sales" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"status" varchar(32) DEFAULT 'paid' NOT NULL,
	"total_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sales" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "price" SET DATA TYPE numeric(12, 2);--> statement-breakpoint
ALTER TABLE "product_variants" ADD COLUMN "sold_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "product_variants" ADD COLUMN "last_sold_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_product_variant_id_product_variants_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_sale_items_sale_id" ON "sale_items" USING btree ("sale_id");--> statement-breakpoint
CREATE INDEX "idx_sale_items_variant_id" ON "sale_items" USING btree ("product_variant_id");--> statement-breakpoint
CREATE INDEX "idx_sale_items_user_id" ON "sale_items" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_sales_user_id" ON "sales" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_sales_created_at" ON "sales" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_variants_product_id" ON "product_variants" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_variants_user_id" ON "product_variants" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_products_user_id" ON "products" USING btree ("user_id");--> statement-breakpoint
CREATE POLICY "users_select_own_sale_items" ON "sale_items" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.uid()) = "sale_items"."user_id");--> statement-breakpoint
CREATE POLICY "users_insert_own_sale_items" ON "sale_items" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) = "sale_items"."user_id");--> statement-breakpoint
CREATE POLICY "users_update_own_sale_items" ON "sale_items" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.uid()) = "sale_items"."user_id") WITH CHECK ((select auth.uid()) = "sale_items"."user_id");--> statement-breakpoint
CREATE POLICY "users_delete_own_sale_items" ON "sale_items" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.uid()) = "sale_items"."user_id");--> statement-breakpoint
CREATE POLICY "users_select_own_sales" ON "sales" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.uid()) = "sales"."user_id");--> statement-breakpoint
CREATE POLICY "users_insert_own_sales" ON "sales" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) = "sales"."user_id");--> statement-breakpoint
CREATE POLICY "users_update_own_sales" ON "sales" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.uid()) = "sales"."user_id") WITH CHECK ((select auth.uid()) = "sales"."user_id");--> statement-breakpoint
CREATE POLICY "users_delete_own_sales" ON "sales" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.uid()) = "sales"."user_id");