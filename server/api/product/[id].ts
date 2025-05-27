import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import postgres from 'postgres';
import {
  productsTable,
  productVariants,
  ProductWithVariant,
} from '~/db/schema';

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

  const getProductWithVariants = await db
    .select()
    .from(productsTable)
    .innerJoin(productVariants, eq(productVariants.productId, productsTable.id))
    .where(eq(productsTable.id, productId));

  const productWithVariants = {
    product: getProductWithVariants[0]?.products, // Product info from first row
    variants: getProductWithVariants.map((row) => row.product_variants), // All variants
  };

  const product: ProductWithVariant[] = otherProduct.map((row) => ({
    productInfo: row.products,
    variantInfo: row.product_variants,
  }));

  return { product: product[0], variants };
});
