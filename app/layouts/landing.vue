<script setup lang="ts">
  import DisclaimerModal from '@/components/landing/DisclaimerModal.vue';
</script>

<template>
  <div
    class="bg-background text-foreground selection:bg-primary selection:text-primary-foreground relative min-h-screen w-full"
  >
    <slot />
    <DisclaimerModal />
  </div>
</template>
