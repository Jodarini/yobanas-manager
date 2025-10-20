<script setup lang="ts">
  import {
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
  } from '@/components/ui/sidebar';
  import AppSidebar from '@/components/AppSidebar.vue';
  import { SunIcon, MoonIcon } from 'lucide-vue-next';

  const colorMode = useColorMode();
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

        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline">
              <SunIcon
                class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
              />
              <MoonIcon
                class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
              />
              <span class="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem @click="colorMode.preference = 'light'">
              Light
            </DropdownMenuItem>
            <DropdownMenuItem @click="colorMode.preference = 'dark'">
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem @click="colorMode.preference = 'system'">
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <!-- <div class="flex flex-1 items-center gap-2"> -->
        <!-- Add breadcrumbs or page title here if needed -->
        <!-- </div> -->
      </header>

      <main class="flex max-w-6xl flex-1 flex-col gap-4 overflow-auto p-4">
        <slot />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
