import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import postgres from 'postgres';
import { deleteVariantSchema, productVariants } from '~/db/schema';

export default defineEventHandler(async (event) => {
  const connectionString = process.env.TEST_SUPABASE_URL!;
  const client = postgres(connectionString);
  const db = drizzle(client);

  const body = await readBody(event);
  console.log(body);
  const product = deleteVariantSchema.parse(body);
  console.log({ deleted: product });
  return;

  try {
    if (
      !product.id ||
      !product.variantInfo.color ||
      !product.variantInfo.size
    ) {
      throw new Error(
        'No se pudo agregar el producto, no se ha encontrado el id o el color o el tamaño'
      );
    }
    await db.delete(productVariants).where(eq(productVariants.id, product.id));
    console.log('added');
  } catch (error) {
    console.error('Error adding product:', error);
  }
});
