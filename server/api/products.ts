import { sql, eq } from 'drizzle-orm';
import { productsTable, productVariants } from '~/db/schema';
import { useDB } from '../utils/db';

export default defineEventHandler(async (event) => {

  const db = useDB();

  const allProducts = await db
    .select({
      id: productsTable.id,
      title: productsTable.title,
      price: productsTable.price,
      category: productsTable.category,
      thumbnail: productsTable.thumbnail,
      brand: productsTable.brand,
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
      productsTable.brand,
      productsTable.thumbnail
    );

  return allProducts;
});
