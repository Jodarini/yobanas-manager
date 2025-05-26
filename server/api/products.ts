import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { productsTable } from '~/db/schema';

export default defineEventHandler(async () => {
  const connectionString = process.env.TEST_SUPABASE_URL!;

  const client = postgres(connectionString);
  const db = drizzle(client);

  const allProducts = await db.select().from(productsTable);
  return allProducts;
});
