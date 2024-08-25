<script setup lang="ts">
import { cn } from "~/lib/utils";
import { Icon } from "@iconify/vue";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const colorMode = useColorMode();
</script>

<template>
  <nav
    :class="
      cn(
        'flex items-center space-x-4 justify-between lg:space-x-6',
        $attrs.class ?? '',
      )
    "
  >
    <div class="space-x-4 lg:space-x-6">
      <a
        href="/examples/dashboard"
        class="text-sm font-medium transition-colors hover:text-primary"
      >
        Overview
      </a>
      <a
        href="/examples/dashboard"
        class="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Customers
      </a>
      <a
        href="/examples/dashboard"
        class="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Products
      </a>
      <a
        href="/examples/dashboard"
        class="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Settings
      </a>
    </div>

    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="outline">
          <Icon
            icon="radix-icons:moon"
            class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
          />
          <Icon
            icon="radix-icons:sun"
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
