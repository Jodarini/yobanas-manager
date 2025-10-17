import { eq } from 'drizzle-orm';
import { productsTable } from '~/db/schema';
import { useDB } from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  const db = useDB()

  const { id } = getRouterParams(event);
  const productId = parseInt(id);
  try {
    await db.transaction(async (tx) => {
      await tx.delete(productsTable).where(eq(productsTable.id, productId))
    })
    return { message: 'Success!' }
  } catch (err) {
    console.error('Error deleting the product', err);
    if (err.statusCode === 404) {
      throw err;
    }
  }
});
