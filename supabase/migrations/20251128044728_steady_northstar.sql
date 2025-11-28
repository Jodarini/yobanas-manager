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
ALTER TABLE "payment_sources" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE INDEX "idx_payment_sources_user_id" ON "payment_sources" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_payment_sources_user_wompi" ON "payment_sources" USING btree ("user_id","wompi_payment_source_id");--> statement-breakpoint
CREATE POLICY "users_select_own_payment_sources" ON "payment_sources" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.uid()) = "payment_sources"."user_id");--> statement-breakpoint
CREATE POLICY "users_insert_own_payment_sources" ON "payment_sources" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) = "payment_sources"."user_id");--> statement-breakpoint
CREATE POLICY "users_update_own_payment_sources" ON "payment_sources" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.uid()) = "payment_sources"."user_id") WITH CHECK ((select auth.uid()) = "payment_sources"."user_id");