import { and, eq } from 'drizzle-orm';
import { deleteVariantSchema, productVariants } from '~/db/schema';
import { useDB } from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  const db = useDB()

  const body = await readBody(event);
  const product = deleteVariantSchema.parse(body);

  try {
    await db
      .delete(productVariants)
      .where(
        and(
          eq(productVariants.productId, product.id),
          eq(productVariants.size, product.size),
          eq(productVariants.color, product.color)
        )
      );
  } catch (error) {
    console.error('Error borrando producto: ', error);
  }
  return;
})
