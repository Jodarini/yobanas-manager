<script setup lang="ts">
  import MainNav from '../components/ui/nav/MainNav.vue';
</script>

<template>
  <ClientOnly>
    <Toaster />
  </ClientOnly>
  <div class="w-full border-b bg-arena p-2 shadow-md">
    <MainNav class="bg-inherit" />
  </div>
  <slot />
</template>
