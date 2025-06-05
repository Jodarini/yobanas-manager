import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import postgres from 'postgres';
import type { ProductWithVariant } from '~/db/schema';
import { editProductSchema, productsTable, productVariants } from '~/db/schema';

export default defineEventHandler(async (event) => {
  const connectionString = process.env.TEST_SUPABASE_URL!;

  const client = postgres(connectionString);
  const db = drizzle(client);
  const productId = parseInt(event.context.params!.id);
  const { id } = getRouterParams(event);

  if (event.method === 'PUT' || event.method === 'PATCH') {
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
      const updatePayload: Record<string, unknown> = {};

      if (product.productInfo.title) {
        updatePayload.title = product.productInfo.title;
      }
      if (product.productInfo.description) {
        updatePayload.description = product.productInfo.description;
      }
      if (product.productInfo.price) {
        updatePayload.price = product.productInfo.price;
      }
      if (product.productInfo.brand) {
        updatePayload.brand = product.productInfo.brand;
      }
      if (product.productInfo.thumbnail) {
        updatePayload.thumbnail = product.productInfo.thumbnail;
      }
      if (product.productInfo.category) {
        updatePayload.category = product.productInfo.category;
      }
      if (Object.keys(updatePayload).length === 0) {
        throw createError({
          statusCode: 400,
          statusMessage: 'No fields to update',
        });
      }

      await db
        .update(productsTable)
        .set(updatePayload)
        .where(eq(productsTable.id, id));

      return { success: true, payloadWas: updatePayload };
    } catch (err) {
      console.error('Error parsing the body', err);
      throw err;
    } finally {
      await client.end();
    }
  }

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
