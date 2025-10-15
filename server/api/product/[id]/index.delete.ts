import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { productsTable, productVariants } from '~/db/schema';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const connectionString = process.env.TEST_SUPABASE_URL!;
  const client = postgres(connectionString);
  const db = drizzle(client);

  const { id } = getRouterParams(event);
  const productId = parseInt(id);
  console.log({ productId })
  try {
    // TODO: FIX THIS SO THAT YOU ACTUALLY FIND THE RIGHT VARIANT BASED ON ITS CARACTERISTICS
    await db.transaction(async (tx) => {
      await tx.delete(productsTable).where(eq(productsTable.id, productId))
      // tx.delete(productVariants).where(eq(productVariants.productId, productId))
      console.log('product deleted')
    })
    return { message: 'Success!' }
    // const result = await db
    //   .delete(productsTable)
    //   .where(eq(productsTable.id, body.id));
    // if (result.count === 0) {
    //   return createError({
    //     statusCode: 404,
    //     statusMessage: 'Product not found',
    //   });
    // }
    // return { message: 'Product deleted successfully' };
  } catch (err) {
    console.error('Error deleting the product', err);
    if (err.statusCode === 404) {
      throw err;
    }
  } finally {
    await client.end();
  }
});
