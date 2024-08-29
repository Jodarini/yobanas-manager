import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { products } from "~/db/schema";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  console.log(body.product.title);
  const connectionString = process.env.TEST_SUPABASE_URL!;
  const client = postgres(connectionString);
  const db = drizzle(client);
  await db.insert(products).values({
    title: body.product.title,
    description: body.product.description,
    price: body.product.price,
    stock: "1",
    // tags: [body.product.tags],
    thumbnail: body.product.thumbnail,
    category: [body.product.category],
  });
  return { body };

  const allUsers = await db.select().from(products);
  // return allUsers;
});
