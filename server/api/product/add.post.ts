import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { products } from "~/db/schema";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  console.log(body);
  return body;
  // const connectionString = process.env.TEST_SUPABASE_URL!;
  //
  // const client = postgres(connectionString);
  // const db = drizzle(client);
  //
  // const allUsers = await db.select().from(products);
  // return allUsers;
});
