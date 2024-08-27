<script setup lang="ts">
import { Input } from "@/components/ui/input";
const position = ref("bottom");

const store = useProductsStore();
</script>

<template>
  <Input placeholder="Search for your product" v-model="store.filterText" />
  <div class="flex gap-2">
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="outline"> Filter </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="w-56">
        <DropdownMenuLabel>Select category</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          v-model="store.filterCategory"
          v-for="category in store.productCategories"
        >
          <DropdownMenuRadioItem :value="category">
            {{ category }}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>

    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="outline"> Sort </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="w-56">
        <DropdownMenuLabel>Select order</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup v-model="position">
          <DropdownMenuRadioItem value="bags"> Name </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="category">
            Category
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="new"> New </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="price"> Price </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
  <slot />
</template>

<style scoped></style>
