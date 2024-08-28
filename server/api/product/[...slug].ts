import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import postgres from "postgres";
import { products } from "~/db/schema";

export default defineEventHandler(async (event) => {
  const connectionString = process.env.TEST_SUPABASE_URL!;

  const client = postgres(connectionString);
  const db = drizzle(client);
  const productId = parseInt(event.context.params!.slug);

  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);
  console.log({ product });
  return product;
});
