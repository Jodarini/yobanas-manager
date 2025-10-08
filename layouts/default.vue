<script setup lang="ts">
  import {
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
  } from '@/components/ui/sidebar';
  import AppSidebar from '@/components/AppSidebar.vue';
</script>

<template>
  <SidebarProvider>
    <ClientOnly>
      <Toaster />
    </ClientOnly>
    <AppSidebar />
    <SidebarInset class="flex flex-1 flex-col">
      <header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger class="-ml-1" />
        <div class="flex flex-1 items-center gap-2">
          <!-- Add breadcrumbs or page title here if needed -->
        </div>
      </header>

      <main class="flex flex-1 flex-col gap-4 overflow-auto p-4">
        <slot />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
