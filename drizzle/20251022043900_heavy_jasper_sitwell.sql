ALTER TABLE "product_variants" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "category" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "product_variants" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
CREATE POLICY "users_select_own_variants" ON "product_variants" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.uid()) = "product_variants"."user_id");--> statement-breakpoint
CREATE POLICY "users_insert_own_variants" ON "product_variants" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) = "product_variants"."user_id");--> statement-breakpoint
CREATE POLICY "users_update_own_variants" ON "product_variants" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.uid()) = "product_variants"."user_id") WITH CHECK ((select auth.uid()) = "product_variants"."user_id");--> statement-breakpoint
CREATE POLICY "users_delete_own_variants" ON "product_variants" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.uid()) = "product_variants"."user_id");--> statement-breakpoint
CREATE POLICY "users_select_own_products" ON "products" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.uid()) = "products"."user_id");--> statement-breakpoint
CREATE POLICY "users_insert_own_products" ON "products" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) = "products"."user_id");--> statement-breakpoint
CREATE POLICY "users_update_own_products" ON "products" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.uid()) = "products"."user_id") WITH CHECK ((select auth.uid()) = "products"."user_id");--> statement-breakpoint
CREATE POLICY "users_delete_own_products" ON "products" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.uid()) = "products"."user_id");