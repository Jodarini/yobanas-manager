<script setup lang="ts">
  import {
    Home,
    Package,
    ShoppingCart,
    Settings,
    Users,
    BarChart,
  } from 'lucide-vue-next';
  import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
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
</script>

<template>
  <Sidebar>
    <SidebarHeader>
      <div class="flex items-center gap-2 px-4 py-2">
        <div
          class="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg"
        >
          <Package class="h-4 w-4" />
        </div>
        <div class="flex flex-col">
          <span class="text-sm font-semibold">Store Admin</span>
          <span class="text-muted-foreground text-xs">Gestión de tienda</span>
        </div>
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
        <p class="text-muted-foreground text-xs">© 2025 Yobanas</p>
      </div>
    </SidebarFooter>
  </Sidebar>
</template>
