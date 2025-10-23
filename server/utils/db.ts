import type { Session } from '@supabase/supabase-js';
import { sql } from 'drizzle-orm';
import type { PgTransaction } from 'drizzle-orm/pg-core';
import type { PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

let client: ReturnType<typeof postgres> | null = null;
let db: ReturnType<typeof drizzle> | null = null;

export const useDB = () => {
  const config = useRuntimeConfig();
  if (!client) {
    client = postgres(config.databaseUrl, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });
    db = drizzle(client);
  }
  return db!;
};

export const useAuthDB = async <T>(
  session: Session,
  callback: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tx: PgTransaction<PostgresJsQueryResultHKT, Record<string, unknown>, any>
  ) => Promise<T>
): Promise<T> => {
  const db = useDB();

  return db.transaction(async (tx) => {
    const claims = {
      sub: session.user.id,
      role: session.user.role || 'authenticated',
      email: session.user.email,
    };

    const claimsJson = JSON.stringify(claims).replace(/'/g, "''");
    await tx.execute(
      sql.raw(`SET LOCAL "request.jwt.claims" = '${claimsJson}'`)
    );

    await tx.execute(sql`SET LOCAL ROLE authenticated`);

    return await callback(tx);
  });
};
