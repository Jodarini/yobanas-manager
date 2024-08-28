import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema.ts",
  dialect: "postgresql",
  migrations: {
    prefix: "supabase",
  },
  dbCredentials: {
    url: process.env.TEST_SUPABASE_URL!,
  },
});
