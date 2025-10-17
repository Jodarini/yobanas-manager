import { addVariantSchema, productVariants } from '~/db/schema';
import { useDB } from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  const db = useDB()

  const body = await readBody(event);
  const product = addVariantSchema.parse(body);

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
    await db.insert(productVariants).values({
      productId: product.id,
      color: product.variantInfo.color,
      size: product.variantInfo.size,
      stock: product.variantInfo.stock,
    });
    console.log('added');
  } catch (error) {
    console.error('Error adding product:', error);
  }
});
