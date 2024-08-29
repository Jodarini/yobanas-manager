import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import type { Product } from "~/db/schema";
import { products } from "~/db/schema";
import { z } from "zod";

const ProductSchema = z.object({
  title: z.string().min(1, "Product title is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  category: z.array(z.string()).min(1, "At least one category is required"),
  thumbnail: z.string().url("Thumbnail must be a valid URL").optional(),
  tags: z.array(z.string()).optional(),
  stock: z.number().int().nonnegative("Stock must be a non-negative integer"),
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
    stock: product.stock.toString(),
    thumbnail: product.thumbnail,
    category: product.category,
    tags: product.tags,
  };
  const result = await db.insert(products).values(insertData).returning();
  await client.end();
  return result[0];
});
