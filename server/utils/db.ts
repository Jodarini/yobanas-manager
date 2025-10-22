import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import type { Session } from '@supabase/supabase-js';

let client: ReturnType<typeof postgres> | null = null;
let db: ReturnType<typeof drizzle> | null = null;

export const useDB = () => {
  const config = useRuntimeConfig();
  if (!client) {
    client = postgres(config.databaseUrl);
    db = drizzle(client);
  }
  return db;
};

export const useAuthDB = async <T>(
  session: Session,
  callback: (tx: ReturnType<typeof drizzle>) => Promise<T>
): Promise<T> => {
  const db = useDB();

  return db.transaction(async (tx) => {
    const claims = {
      sub: session.user.id,
      role: session.user.role || 'authenticated',
      email: session.user.email,
    };

    await tx.execute(
      sql.raw(`SET LOCAL "request.jwt.claims" = '${JSON.stringify(claims)}';`)
    );
    await tx.execute(sql`SET LOCAL ROLE authenticated`);

    // Debug: Check what auth.uid() returns
    const result = await tx.execute(sql`SELECT auth.uid() as uid`);
    console.log('auth.uid() returns:', result);

    return callback(tx);
  });
};
