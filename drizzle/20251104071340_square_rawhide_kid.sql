CREATE UNIQUE INDEX "uq_variants_sku" ON "product_variants" USING btree ("sku");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_products_sku" ON "products" USING btree ("sku");