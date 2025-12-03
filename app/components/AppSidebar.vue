<script setup lang="ts">
  import {
    Package,
    DatabaseIcon,
    SunIcon,
    MoonIcon,
    ShoppingCartIcon,
    Store,
    MonitorIcon,
  } from 'lucide-vue-next';

  const { user, signOut, isLoading } = useAuth();

  const route = useRoute();

  const menuItems = [
    {
      title: 'Dashboard',
      url: '/',
      icon: DatabaseIcon,
    },
    {
      title: 'Productos',
      url: '/products',
      icon: Package,
    },
    {
      title: 'Carrito',
      url: '/add-sale',
      icon: ShoppingCartIcon,
    },
    {
      title: 'Ventas',
      url: '/sales',
      icon: Store,
    },
  ];

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
            <DropdownMenuItem
              class="focus:text-sidebar-foreground focus:bg-transparent"
            >
              Theme
              <ToggleGroup type="single" class="bg-accent-foreground/10">
                <ToggleGroupItem
                  class="hover:text-foreground hover:bg-foreground/5"
                  :class="{
                    'bg-accent-foreground/30 focus:text-foreground-accent hover:bg-accent-foreground/35':
                      colorMode.preference === 'light',
                  }"
                  value="light"
                  aria-label="Toggle light"
                  @click="colorMode.preference = 'light'"
                >
                  <SunIcon />
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="dark"
                  aria-label="Toggle dark"
                  class="hover:text-foreground hover:bg-foreground/5"
                  :class="{
                    'bg-accent-foreground/30 focus:text-foreground-accent hover:bg-accent-foreground/35':
                      colorMode.preference === 'dark',
                  }"
                  @click="colorMode.preference = 'dark'"
                >
                  <MoonIcon />
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="system"
                  aria-label="Toggle system"
                  class="hover:text-foreground hover:bg-foreground/5"
                  :class="{
                    'bg-accent-foreground/30 focus:text-foreground-accent hover:bg-accent-foreground/35':
                      colorMode.preference === 'system',
                  }"
                  @click="colorMode.preference = 'system'"
                >
                  <MonitorIcon />
                </ToggleGroupItem>
              </ToggleGroup>
            </DropdownMenuItem>
            <NuxtLink as-child to="/subscriptions">
              <DropdownMenuItem>Tu subscripción</DropdownMenuItem>
            </NuxtLink>
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
      <div class="space-y-2 px-4 py-2 text-center">
        <Button v-if="!user" class="min-w-full" as-child variant="outline">
          <NuxtLink to="/login">Iniciar sesión</NuxtLink>
        </Button>
        <Button
          v-else
          :disabled="isLoading"
          variant="outline"
          class="flex min-w-full items-center"
          @click="signOut"
        >
          <span v-if="isLoading" class="flex items-center">
            <Spinner class="mr-2" />
            Cerrando sesión...
          </span>
          <span v-else>Cerrar sesión</span>
        </Button>
        <!-- <Button as-child class="mb-4 min-w-full"> -->
        <!--   <NuxtLink to="/add-product" class="flex flex-row justify-evenly"> -->
        <!--     <PlusIcon /> -->
        <!--     Nuevo producto -->
        <!--   </NuxtLink> -->
        <!-- </Button> -->
        <p class="text-muted-foreground text-xs">
          © 2025 StockIt
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
