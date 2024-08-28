<script setup lang="ts">
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { products } from "./db/schema";

const connectionString = process.env.TEST_SUPABASE_URL!;

const client = postgres(connectionString);
const db = drizzle(client);

const allUsers = await db.select().from(products);
console.log({ allUsers });
</script>

<template>
  <div class="flex h-screen flex-col items-start justify-start">
    <NuxtLayout>
      <div class="flex flex-col gap-4 p-4">
        <NuxtPage />
      </div>
    </NuxtLayout>
  </div>
</template>

<style>
@import url("~/assets/css/main.css");
</style>
