import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

let db: ReturnType<typeof drizzle> | null = null;
let client: ReturnType<typeof postgres> | null = null;

export const useDB = () => {
  const config = useRuntimeConfig();
  if (!client) {
    client = postgres(config.supabaseUrl);
    db = drizzle(client);
  }

  return db;
};
