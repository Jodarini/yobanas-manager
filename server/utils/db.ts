import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

let db: ReturnType<typeof drizzle> | null = null;
let client: ReturnType<typeof postgres> | null = null;

export const useDB = () => {
  const config = useRuntimeConfig();
  console.log('DB URL exists:', !!config.supabaseUrl);
  console.log('DB URL starts with:', config.supabaseUrl?.substring(0, 20));
  if (!client) {
    client = postgres(config.supabaseUrl);
    db = drizzle(client);
  }

  return db;
};
