import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { products } from "~/db/schema";

export default defineEventHandler(async (event) => {
  const connectionString = process.env.TEST_SUPABASE_URL!;
  const client = postgres(connectionString);
  const db = drizzle(client);
  db.delete(products).where(eq(products.id, +event.context.params!));
});
