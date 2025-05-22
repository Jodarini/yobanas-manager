import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import type { Product } from "~/db/schema";
import { products, productVariants } from "~/db/schema";
import { z } from "zod";
import { eq, and } from "drizzle-orm";


const VariantSchema = z.object({
  size: z.string().min(1, "Size is required"),
  color: z.string().min(1, "Color is required"),
  stock: z.number().int().nonnegative("Stock must be a non-negative integer"),
});

const ProductSchema = z.object({
  title: z.string().min(1, "Product title is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  category: z.array(z.string()).min(1, "At least one category is required"),
  brand: z.string().min(1, "La marca debe tener al menos un caracter"),
  thumbnail: z.string().url("Thumbnail must be a valid URL").optional(),
  tags: z.array(z.string()).optional(),
  variants: VariantSchema
  // stock: z.number().int().nonnegative("Stock must be a non-negative integer"),
});

const RequestSchema = z.object({
  product: ProductSchema,
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { product } = RequestSchema.parse(body);
  const connectionString = process.env.TEST_SUPABASE_URL!;
  const client = postgres(connectionString);
  const db = drizzle(client);

  // check if product title and color variant already exists
  // TODO: Check if brand is the same aswell?
  const productByTitleAndColor = await db
    .select()
    .from(products)
    .innerJoin(
      productVariants,
      and(
        eq(productVariants.productId, products.id),
        eq(productVariants.color, product.variants.color)
      )
    )
    .where(eq(products.title, product.title))
    .limit(1);

  // Selects the products variants
  if (productByTitleAndColor.length) {
    const productVariantToUpdate = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, productByTitleAndColor[0].products.id)).limit(1)

    const currentStock = productVariantToUpdate[0].stock;
    const newStock = currentStock + 1;

    await db
      .update(productVariants).set({ stock: newStock }).where(eq(productVariants.productId, productVariantToUpdate[0].productId))
    return
  }

  // add new reference
  const insertData: Product = {
    title: product.title,
    description: product.description,
    price: product.price.toString(),
    brand: product.brand,
    thumbnail: product.thumbnail,
    category: product.category,
    tags: product.tags,
  };

  // Selects a product to add new product variant
  const productWithId = await db
    .select()
    .from(products)
    .innerJoin(
      productVariants,
      and(
        eq(productVariants.productId, products.id)
      )
    )
    .where(eq(products.title, product.title))

  if (productWithId.length) {
    console.log('Adding new variant: ')
    const foundProduct = productWithId[0]
    console.log({ foundProduct })
    const returnProduct = await db.insert(productVariants).values({
      productId: foundProduct.products.id,
      size: product.variants.size,
      color: product.variants.color,
      stock: product.variants.stock
    })
    return returnProduct
  }

  const result = await db.insert(products).values(insertData).returning();
  const productId = result[0].id;


  if (product.variants) {
    await db.insert(productVariants).values(
      {
        productId,
        size: product.variants.size,
        color: product.variants.color,
        stock: product.variants.stock,
      }
    );
  }

  await client.end();
  return result[0];
});
