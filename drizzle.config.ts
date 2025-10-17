import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './db/schema.ts',
  dialect: 'postgresql',
  migrations: {
    prefix: 'supabase',
  },
  dbCredentials: {
    url: process.env.SUPABASE_URL || process.env.NUXT_SUPABASE_URL!,
  },
});
