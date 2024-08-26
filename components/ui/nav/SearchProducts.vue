<script setup lang="ts">
import { Input } from "@/components/ui/input";
const position = ref("bottom");
</script>

<template>
  <Input placeholder="Search for your product" />
  <div class="flex gap-2">
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="outline"> Filter </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="w-56">
        <DropdownMenuLabel>Select category</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup v-model="position">
          <DropdownMenuRadioItem value="bags"> Bags </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dresses">
            Dresses
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="shoes"> Shoes </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="shirts"> Shirts </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="jeans"> Jeans </DropdownMenuRadioItem>
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
          <DropdownMenuRadioItem value="ammount">
            Ammount
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
  <slot />
</template>

<style scoped></style>
