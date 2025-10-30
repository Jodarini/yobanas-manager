<script setup lang="ts">
import Toaster from '~/components/ui/toast/Toaster.vue';

const { initAuth, userId } = useAuth();
await initAuth();
</script>

<template>
  <SidebarProvider>
    <ClientOnly>
      <Toaster />
    </ClientOnly>
    <AppSidebar />
    <SidebarInset class="flex flex-1 flex-col">
      <header class="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border px-4">
        <SidebarTrigger class="-ml-1" />

        <div v-if="userId" class="flex flex-row gap-4">
          <Button as-child>
            <NuxtLink to="/add-product" class="flex flex-row justify-evenly">
              Agregar producto
            </NuxtLink>
          </Button>

          <Button as-child>
            <NuxtLink to="/add-sale">Iniciar venta</NuxtLink>
          </Button>
        </div>
      </header>

      <main class="flex max-w-6xl flex-1 flex-col gap-4 overflow-auto p-4">
        <slot />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
