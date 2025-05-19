ALTER TABLE "products" ALTER COLUMN "price" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "stock" SET DATA TYPE numeric(10, 0);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "brand" text NOT NULL;