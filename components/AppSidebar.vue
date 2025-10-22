<script setup lang="ts">
  import { Package, PlusIcon, SunIcon, MoonIcon } from 'lucide-vue-next';
  import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter,
    SidebarHeader,
  } from '@/components/ui/sidebar';

  const route = useRoute();

  const menuItems = [
    {
      title: 'Productos',
      url: '/',
      icon: Package,
    },
    // {
    //   title: 'Productos',
    //   url: '/dashboard/products',
    //   icon: Package,
    // },
    // {
    //   title: 'Pedidos',
    //   url: '/dashboard/orders',
    //   icon: ShoppingCart,
    // },
    // {
    //   title: 'Clientes',
    //   url: '/dashboard/customers',
    //   icon: Users,
    // },
    // {
    //   title: 'Reportes',
    //   url: '/dashboard/reports',
    //   icon: BarChart,
    // },
    // {
    //   title: 'Configuración',
    //   url: '/dashboard/settings',
    //   icon: Settings,
    // },
  ];

  // Check if current route is active
  const isActive = (url: string) => {
    return route.path === url || route.path.startsWith(url + '/');
  };

  const colorMode = useColorMode();
</script>

<template>
  <Sidebar>
    <SidebarHeader>
      <div class="flex items-center justify-between gap-2 px-4 py-2">
        <div
          class="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg"
        >
          <Package class="h-4 w-4" />
        </div>
        <div class="flex flex-col">
          <span class="text-sm font-semibold">Store Admin</span>
          <span class="text-muted-foreground text-xs">Gestión de tienda</span>
        </div>

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
      </div>
    </SidebarHeader>

    <SidebarContent>
      <SidebarGroup>
        <!-- <SidebarGroupLabel>Navegación</SidebarGroupLabel> -->
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in menuItems" :key="item.title">
              <SidebarMenuButton as-child :is-active="isActive(item.url)">
                <NuxtLink :to="item.url">
                  <component :is="item.icon" />
                  <span>{{ item.title }}</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <SidebarFooter>
      <div class="px-4 py-2 text-center">
        <Button as-child class="mb-4 min-w-full">
          <NuxtLink to="/add-product" class="flex flex-row justify-evenly">
            <PlusIcon />
            Nuevo producto
          </NuxtLink>
        </Button>
        <p class="text-muted-foreground text-xs">
          © 2025 Yobana's closet
          <br />
          <NuxtLink
            to="https://www.jodarini.dev"
            target="_blank"
            class="text-accent-foreground"
          >
            by Jodarini.dev
          </NuxtLink>
        </p>
      </div>
    </SidebarFooter>
  </Sidebar>
</template>
