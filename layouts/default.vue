<script setup lang="ts">
  import {
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
  } from '@/components/ui/sidebar';
  import AppSidebar from '@/components/AppSidebar.vue';
  import { useAuth } from '~/composables/useAuth';

  const { initAuth, userId, signOut } = useAuth();
  await initAuth();
</script>

<template>
  <SidebarProvider>
    <ClientOnly>
      <Toaster />
    </ClientOnly>
    <AppSidebar />
    <SidebarInset class="flex flex-1 flex-col">
      <header
        class="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-(--border) px-4"
      >
        <SidebarTrigger class="-ml-1" />

        <Button v-if="!userId" as-child variant="outline">
          <NuxtLink to="/login">Iniciar sesión</NuxtLink>
        </Button>
        <Button v-else variant="outline" @click="signOut">Cerrar sesión</Button>
      </header>

      <main class="flex max-w-6xl flex-1 flex-col gap-4 overflow-auto p-4">
        <slot />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
