import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { products } from "~/db/schema";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const connectionString = process.env.TEST_SUPABASE_URL!;
  const client = postgres(connectionString);
  const db = drizzle(client);
  try {
    const result = await db.delete(products).where(eq(products.id, body.id));
    if (result.count === 0) {
      return createError({
        statusCode: 404,
        statusMessage: "Product not found",
      });
    }
    return { message: "Product deleted successfully" };
  } catch (err) {
    console.error("Error deleting the product", err);
    if (err.statusCode === 404) {
      throw err;
    }
  } finally {
    await client.end();
  }
});
