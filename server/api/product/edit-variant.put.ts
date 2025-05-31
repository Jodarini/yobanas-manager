import { eq, and } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { editProductSchema, productsTable, productVariants } from '~/db/schema';

export default defineEventHandler(async (event) => {
  const connectionString = process.env.TEST_SUPABASE_URL!;
  const client = postgres(connectionString);
  const db = drizzle(client);

  try {
    const body = await readBody(event);
    const parseResult = editProductSchema.safeParse(body);

    if (!parseResult.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request data',
        data: parseResult.error.errors,
      });
    }

    const product = parseResult.data;
    // Validate required fields
    if (!product.variantInfo.color || !product.variantInfo.size) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Color and size are required for variant updates',
      });
    }

    const result = await db.transaction(async (tx) => {
      const queryResult = await tx
        .select()
        .from(productsTable)
        .innerJoin(
          productVariants,
          and(
            eq(productVariants.productId, productsTable.id),
            eq(productVariants.color, product.variantInfo.color!),
            eq(productVariants.size, product.variantInfo.size!)
          )
        )
        .where(eq(productsTable.title, product.productInfo.title!))
        .limit(1);

      const result = await tx
        .update(productVariants)
        .set({ stock: product.variantInfo.stock })
        .where(eq(productVariants.id, queryResult[0].product_variants.id))
        .returning();

      return {
        message: 'Editó la variante del producto',
        product: {
          productInfo: result,
        },
      };
    });
    return result;
  } catch (err) {
    console.error('Error parsing the body', err);
    throw err;
  } finally {
    await client.end();
  }
});
