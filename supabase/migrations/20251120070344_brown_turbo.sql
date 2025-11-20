ALTER TABLE "products" ALTER COLUMN "stock" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "sold_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "last_sold_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_products_created_at" ON "products" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_products_user_created" ON "products" USING btree ("user_id","created_at");