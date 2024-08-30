import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { products } from "~/db/schema";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const connectionString = process.env.TEST_SUPABASE_URL!;
  const client = postgres(connectionString);
  const db = drizzle(client);
  await db.delete(products).where(eq(products.id, body.id));
  await client.end();
});
