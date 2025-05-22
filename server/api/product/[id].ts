import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import postgres from "postgres";
import { products, productVariants } from "~/db/schema";

export default defineEventHandler(async (event) => {
  const connectionString = process.env.TEST_SUPABASE_URL!;

  const client = postgres(connectionString);
  const db = drizzle(client);
  const productId = parseInt(event.context.params!.id);

  const product = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, productId))

  //selects the product with variants with a desired ID
  const [otherProduct] = await db
    .select()
    .from(productVariants)
    .innerJoin(products, eq(products.id, productId))
    .where(eq(productVariants.productId, productId))

  const otherProducts = await db
    .select()
    .from(productVariants)
    .innerJoin(products, eq(products.id, productId))
    .where(eq(productVariants.productId, productId))
  console.log(product)

  return otherProduct;
});
