<script setup lang="ts">
  import Toaster from '~/components/ui/toast/Toaster.vue';

  const user = useSupabaseUser();

  const route = useRoute();
  const breadcrumbs = computed(() => {
    const segments = route.path.split('/').filter((item) => item !== '');
    return segments.map((segment, index) => {
      const path = '/' + segments.slice(0, index + 1).join('/');
      return { label: segment, path };
    });
  });
</script>

<template>
  <SidebarProvider>
    <ClientOnly>
      <Toaster />
    </ClientOnly>
    <AppSidebar />
    <SidebarInset class="flex flex-1 flex-col">
      <header
        class="border-border flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4"
      >
        <div class="flex flex-row items-center gap-4">
          <SidebarTrigger class="-ml-1" />
          <Breadcrumb>
            <BreadcrumbList>
              <NuxtLink href="/">Home</NuxtLink>
              <BreadcrumbSeparator />
              <template
                v-for="(breadcrumb, index) in breadcrumbs"
                :key="breadcrumb.path"
              >
                <BreadcrumbItem>
                  <NuxtLink :href="breadcrumb.path">
                    {{ breadcrumb.label }}
                  </NuxtLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator v-if="index !== breadcrumbs.length - 1" />
              </template>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div v-if="user" class="flex flex-row gap-4">
          <Button as-child>
            <NuxtLink to="/add-product" class="flex flex-row justify-evenly">
              Agregar producto
            </NuxtLink>
          </Button>

          <Button as-child>
            <!-- <NuxtLink to="/add-sale">Iniciar venta</NuxtLink> -->
          </Button>
        </div>
      </header>

      <main class="flex max-w-6xl flex-1 flex-col gap-4 overflow-auto p-4">
        <slot />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
