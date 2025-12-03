<script setup lang="ts">
  import { Button } from '@/components/ui/button';
</script>

<template>
  <header
    class="bg-background/80 fixed top-0 z-50 w-full border-b backdrop-blur-md"
  >
    <div class="container mx-auto flex h-16 items-center justify-between px-4">
      <div class="flex items-center gap-2 text-xl font-bold tracking-tighter">
        <div
          class="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg"
        >
          Y
        </div>
        StockIT
      </div>

      <nav class="hidden items-center gap-6 md:flex">
        <a
          href="#features"
          class="hover:text-primary text-sm font-medium transition-colors"
        >
          Características
        </a>
        <a
          href="#pricing"
          class="hover:text-primary text-sm font-medium transition-colors"
        >
          Precios
        </a>
      </nav>

      <div class="flex items-center gap-4">
        <Button variant="ghost" size="sm" as-child>
          <NuxtLink to="/login">Entrar</NuxtLink>
        </Button>
        <Button size="sm" as-child>
          <NuxtLink to="/sign-up">Registrarse</NuxtLink>
        </Button>
      </div>
    </div>
  </header>
</template>
