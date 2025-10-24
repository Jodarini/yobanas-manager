<script setup lang="ts">
  import { useAuth } from '~/composables/useAuth';
  // import Toaster from '~/components/ui/toast/Toaster.vue';

  const { initAuth, userId, signOut, isLoading } = useAuth();
  await initAuth();
</script>

<template>
  <SidebarProvider>
    <ClientOnly>
      <!-- <Toaster /> -->
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
        <Button
          v-else
          :disabled="isLoading"
          class="flex items-center"
          @click="signOut"
        >
          <span v-if="isLoading" class="flex items-center">
            <Spinner class="mr-2" />
            Cerrando sesión...
          </span>
          <span v-else>Cerrar sesión</span>
        </Button>
      </header>

      <main class="flex max-w-6xl flex-1 flex-col gap-4 overflow-auto p-4">
        <slot />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
