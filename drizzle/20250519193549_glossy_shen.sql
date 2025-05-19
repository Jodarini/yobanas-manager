CREATE TABLE IF NOT EXISTS "product_variants" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"size" varchar(10) NOT NULL,
	"color" varchar(50) NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN IF EXISTS "stock";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN IF EXISTS "color";