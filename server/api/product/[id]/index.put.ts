import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, and } from 'drizzle-orm';
import postgres from 'postgres';
import type { ProductVariants } from '~/db/schema';
import {
  addVariantSchema,
  editProductSchema,
  editProductSchema2,
  productsTable,
  productVariants,
} from '~/db/schema';

type EditProductInfo = {
  title?: string;
  description?: string | null;
  price?: number;
  category?: string[];
  thumbnail?: string | null;
  brand?: string;
};

async function handleProductUpdate(
  db: PostgresJsDatabase,
  productId: number,
  productInfo: EditProductInfo
) {
  return await db.transaction(async (tx) => {
    const updatePayload = Object.fromEntries(
      Object.entries(productInfo).filter(([_, value]) => value)
    ) as Partial<EditProductInfo>;

    if (Object.keys(updatePayload).length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No fields to update',
      });
    }

    await tx
      .update(productsTable)
      .set(updatePayload)
      .where(eq(productsTable.id, productId));

    return { success: true, payloadWas: updatePayload };
  });
}

async function addProductVariant(
  db: PostgresJsDatabase,
  product: { variantInfo: Partial<Omit<ProductVariants, 'id' | 'productId'>> },
  productId: number
) {
  console.log(product);
  return await db.transaction(async (tx) => {
    if (
      !product.variantInfo.color ||
      !product.variantInfo.size ||
      !product.variantInfo.stock
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields',
      });
    }

    const [variant] = await tx
      .select()
      .from(productVariants)
      .where(
        and(
          eq(productVariants.color, product.variantInfo.color),
          eq(productVariants.size, product.variantInfo.size),
          eq(productVariants.productId, productId)
        )
      );

    const result = await tx
      .update(productVariants)
      .set({ stock: product.variantInfo.stock })
      .returning()
      .where(eq(productVariants.id, variant.id));

    return {
      message: 'Editó la variante del producto',
      product: {
        productInfo: result,
      },
    };
  });
}

export default defineEventHandler(async (event) => {
  const connectionString = process.env.TEST_SUPABASE_URL!;

  const client = postgres(connectionString);
  const db = drizzle(client);
  // const { id } = getRouterParams(event);
  // const productId = parseInt(id);

  try {
    const body = await readBody(event);
    const product = editProductSchema2.parse(body);
    console.log(product);
    db.transaction(async (tx) => {
      const result = await tx
        .update(productsTable)
        .set({
          title: product.productInfo.title,
          description: product.productInfo.description,
          price: product.productInfo.price,
        })
        .returning()
        .where(eq(productsTable.id, product.productInfo.id));

      await tx
        .delete(productVariants)
        .where(eq(productVariants.productId, product.productInfo.id));

      await tx.insert(productVariants).values(
        product.variantInfo.map((v) => ({
          productId: product.productInfo.id,
          size: v.size,
          color: v.color,
          stock: v.stock,
        }))
      );

      // await tx.update(productVariants).set()

      return {
        message: 'Editó el producto',
        product: {
          productInfo: result,
        },
      };
    });

    // if (body.variantInfo) {
    //   const parseResult = addVariantSchema.safeParse(body);

    //   if (!parseResult.success) {
    //     throw createError({
    //       statusCode: 400,
    //       statusMessage: 'Invalid request data',
    //       data: parseResult.error.errors,
    //     });
    //   }
    //   return await addProductVariant(db, body, productId);
    // }

    // const parseResult = editProductSchema.safeParse(body);

    // if (!parseResult.success) {
    //   throw createError({
    //     statusCode: 400,
    //     statusMessage: 'Invalid request data',
    //     data: parseResult.error.errors,
    //   });
    // }

    // return await handleProductUpdate(db, productId, body.productInfo);
  } catch (err) {
    console.error('Error parsing the body', err);
    throw err;
  } finally {
    await client.end();
  }
});
