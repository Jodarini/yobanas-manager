ALTER TABLE "payment_sources" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY "users_select_own_payment_sources" ON "payment_sources" CASCADE;--> statement-breakpoint
DROP POLICY "users_insert_own_payment_sources" ON "payment_sources" CASCADE;--> statement-breakpoint
DROP POLICY "users_update_own_payment_sources" ON "payment_sources" CASCADE;