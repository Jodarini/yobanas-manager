import { sql, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { productsTable, productVariants } from '~/db/schema';

export default defineEventHandler(async () => {
  const connectionString = process.env.TEST_SUPABASE_URL!;

  const client = postgres(connectionString);
  const db = drizzle(client);

  const allProducts = await db
    .select({
      id: productsTable.id,
      title: productsTable.title,
      price: productsTable.price,
      category: productsTable.category,
      thumbnail: productsTable.thumbnail,
      totalStock:
        sql<number>`COALESCE(SUM(${productVariants.stock}), 0)::int`.as(
          'total_stock'
        ),
    })
    .from(productsTable)
    .leftJoin(productVariants, eq(productVariants.productId, productsTable.id))
    .groupBy(
      productsTable.id,
      productsTable.title,
      productsTable.price,
      productsTable.category,
      productsTable.thumbnail
    );

  // If it still drops at runtime, normalize the rows:
  const normalized = allProducts.map((r) => ({
    ...r,
    totalStock: Number((r as any).total_stock ?? (r as any).totalStock ?? 0),
  }));
  console.log(normalized);

  return allProducts;
});
