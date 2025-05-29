import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import type { Product, ProductWithVariant } from '~/db/schema';
import {
  insertProductSchema,
  productsTable,
  productVariants,
} from '~/db/schema';
import { eq, and } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const connectionString = process.env.TEST_SUPABASE_URL!;
  const client = postgres(connectionString);
  const db = drizzle(client);

  const body = await readBody(event);
  const product = insertProductSchema.parse(body);

  try {
    const insertData: Product = {
      title: product.productInfo.title,
      description: product.productInfo.description,
      price: product.productInfo.price.toString(),
      brand: product.productInfo.brand,
      thumbnail: product.productInfo.thumbnail,
      category: product.productInfo.category,
    };

    return await db.transaction(async (tx) => {
      //check if exact variant exists
      const queryResult = await tx
        .select()
        .from(productsTable)
        .innerJoin(
          productVariants,
          and(
            eq(productVariants.productId, productsTable.id),
            eq(productVariants.color, product.variantInfo.color),
            eq(productVariants.size, product.variantInfo.size!)
          )
        )
        .where(eq(productsTable.title, product.productInfo.title))
        .limit(1);
      const existingProductVariant: ProductWithVariant[] = queryResult.map(
        (row) => ({
          productInfo: row.products,
          variantInfo: row.product_variants,
        })
      );

      //add to stock
      if (existingProductVariant.length > 0) {
        const foundItem = existingProductVariant[0];

        await tx
          .update(productVariants)
          .set({ stock: product.variantInfo.stock })
          .where(eq(productVariants.id, foundItem.variantInfo.id!));

        return { message: 'Se agregó stock al producto', product: foundItem };
      }

      //check if product exists with different color
      const existingProduct = await tx
        .select()
        .from(productsTable)
        .innerJoin(
          productVariants,
          and(eq(productVariants.productId, productsTable.id))
        )
        .where(eq(productsTable.title, product.productInfo.title))
        .limit(1);

      // add new variant
      if (existingProduct.length > 0) {
        const productId = existingProduct[0].products.id;

        const newVariant = await tx
          .insert(productVariants)
          .values({
            productId,
            size: product.variantInfo.size,
            color: product.variantInfo.color,
            stock: product.variantInfo.stock,
          })
          .returning();

        return {
          message: 'Agregó nueva variant al producto',
          product: {
            productInfo: existingProduct[0].products,
            variantInfo: newVariant[0],
          },
        };
      }

      //add new product
      console.log('adding product', insertData);
      const newProduct = await tx
        .insert(productsTable)
        .values(insertData)
        .returning();

      const productId = newProduct[0].id;

      const newVariant = await tx
        .insert(productVariants)
        .values({
          productId,
          size: product.variantInfo.size,
          color: product.variantInfo.color,
          stock: product.variantInfo.stock,
        })
        .returning();

      const result: ProductWithVariant = {
        productInfo: newProduct[0],
        variantInfo: newVariant[0],
      };

      return {
        message: 'Creo un nuevo producto',
        product: result,
      };
    });
  } catch (error) {
    console.error('Error adding product:', error);
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to add product',
    });
  }
});
