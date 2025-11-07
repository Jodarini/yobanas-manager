import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './db/schema.ts',
  dialect: 'postgresql',
  out: './supabase/migrations',
  migrations: {
    prefix: 'supabase',
  },
  dbCredentials: {
    url: process.env.NUXT_DATABASE_URL!,
  },
  entities: {
    roles: {
      provider: 'supabase',
    },
  },
});
