<script setup lang="ts">
  import { cn } from '~/lib/utils';
  import { Icon } from '@iconify/vue';
  import SearchProducts from './SearchProducts.vue';

  const route = useRoute();
  const colorMode = useColorMode();
</script>

<template>
  <nav
    :class="
      cn(
        'flex items-center justify-between space-x-4 lg:space-x-6',
        $attrs.class ?? ''
      )
    "
  >
    <div class="flex items-center space-x-4 lg:space-x-6">
      <NuxtLink
        to="/"
        class="text-sm font-medium transition-colors hover:text-primary"
      >
        <img src="/img/logosobreclaro.png" alt="Logo" class="w-6 min-w-20" />
        <!-- <NuxtImg -->
        <!--   src="~/img/logosobreclaro.png" -->
        <!--   class="w-44" -->
        <!--   alt="Yobanas Closet Logo" -->
        <!-- /> -->
      </NuxtLink>
      <template v-if="route.path === '/'">
        <SearchProducts />
      </template>
      <AddProduct />
    </div>

    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="outline">
          <Icon
            icon="radix-icons:sun"
            class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
          />
          <Icon
            icon="radix-icons:moon"
            class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
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
  </nav>
</template>
