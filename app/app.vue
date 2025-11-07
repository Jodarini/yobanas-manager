<script setup lang="ts"></script>

<template>
  <div class="flex h-screen flex-col items-start justify-start">
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style>
  @import url('~/assets/css/tailwind.css');
</style>
