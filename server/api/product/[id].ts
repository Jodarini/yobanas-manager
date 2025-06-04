import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import postgres from 'postgres';
import type { ProductWithVariant } from '~/db/schema';
import { productsTable, productVariants } from '~/db/schema';

export default defineEventHandler(async (event) => {
  const connectionString = process.env.TEST_SUPABASE_URL!;

  const client = postgres(connectionString);
  const db = drizzle(client);
  const productId = parseInt(event.context.params!.id);

  const otherProduct = await db
    .select()
    .from(productVariants)
    .innerJoin(productsTable, eq(productsTable.id, productId))
    .where(eq(productVariants.productId, productId));

  // Select all color variants from product with ID
  const variants = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, productId));

  const product: ProductWithVariant[] = otherProduct.map((row) => ({
    productInfo: row.products,
    variantInfo: row.product_variants,
  }));

  return { product: product[0], variants };
});
