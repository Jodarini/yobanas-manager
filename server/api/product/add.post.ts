import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import type { Product } from "~/db/schema";
import { products, productVariants } from "~/db/schema";
import { z } from "zod";

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
  variants: z.array(VariantSchema).min(1, 'Atleast one variant is required')
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
  const insertData: Product = {
    title: product.title,
    description: product.description,
    price: product.price.toString(),
    // stock: product.stock.toString(),
    brand: product.brand,
    thumbnail: product.thumbnail,
    category: product.category,
    tags: product.tags,
  };

  const result = await db.insert(products).values(insertData).returning();
  const productId = result[0].id;

  if (product.variants?.length) {
    await db.insert(productVariants).values(
      product.variants.map((variant) => ({
        productId,
        size: variant.size,
        color: variant.color,
        stock: variant.stock,
      }))
    );
  }

  await client.end();
  return result[0];
});
