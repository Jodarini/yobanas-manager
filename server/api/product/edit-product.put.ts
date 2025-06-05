import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { editProductSchema, productsTable } from '~/db/schema';

export default defineEventHandler(async (event) => {
  const connectionString = process.env.TEST_SUPABASE_URL!;
  const client = postgres(connectionString);
  const db = drizzle(client);
  const { id } = getRouterParams(event);

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

    const result = await db
      .update(productsTable)
      .set(updatePayload)
      .where(eq(productsTable.title, product.productInfo.title));
  } catch (err) {
    console.error('Error parsing the body', err);
    throw err;
  } finally {
    await client.end();
  }
});
