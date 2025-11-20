ALTER TABLE "sale_items" ALTER COLUMN "product_variant_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sale_items" ADD COLUMN "product_id" integer;--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_sale_items_product_id" ON "sale_items" USING btree ("product_id");