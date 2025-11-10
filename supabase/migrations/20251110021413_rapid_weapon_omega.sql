DROP INDEX "uq_variants_sku";--> statement-breakpoint
DROP INDEX "uq_products_sku";--> statement-breakpoint
CREATE UNIQUE INDEX "uq_variants_user_sku" ON "product_variants" USING btree ("user_id","sku");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_products_user_sku" ON "products" USING btree ("user_id","sku");