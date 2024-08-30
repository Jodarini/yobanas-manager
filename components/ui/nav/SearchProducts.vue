<script setup lang="ts">
import { Input } from "@/components/ui/input";
const position = ref("bottom");

const store = useProductsStore();
</script>

<template>
  <Input v-model="store.filterText" placeholder="Busca por titulo" />
  <div class="flex gap-2">
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="outline"> Filtro </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="w-56">
        <DropdownMenuLabel>Selecciona categoria</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          v-for="category in store.productCategories"
          :key="category"
          v-model="store.filterCategory"
        >
          <DropdownMenuRadioItem :value="category">
            {{ category }}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>

    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="outline"> Ordenar </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="w-56">
        <DropdownMenuLabel>Selecciona orden</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup v-model="position">
          <DropdownMenuRadioItem value="bags"> Nombre </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="category">
            Categoria
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="new"> Mas nuevo </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="price"> Precio </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
  <slot />
</template>
