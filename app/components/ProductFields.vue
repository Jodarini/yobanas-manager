<script setup lang="ts">
import { cn } from '@/lib/utils';
const props = defineProps<{
  form: ReturnType<typeof useProductFormState>;
}>();

</script>

<template>
  <Card>
    <!-- Product Info Fields -->
    <CardHeader>
      <CardTitle>Información del Producto</CardTitle>
    </CardHeader>

    <CardContent>
      <div class="mb-4 flex flex-col gap-4 md:flex-row">
        <FormField v-slot="{ componentField }" class="flex-1" name="title">
          <FormItem class="w-full">
            <div class='flex gap-1 h-4'>
              <FormLabel>Nombre</FormLabel>
              <FormMessage />
            </div>
            <FormControl>
              <Input type="text" placeholder="Nombre del producto" v-bind="componentField" />
            </FormControl>
          </FormItem>
        </FormField>

        <FormField v-slot="{ value }" class="flex-1" name="price">
          <FormItem class="w-full">

            <div class='flex gap-1 h-4'>
              <FormLabel>Precio</FormLabel>
              <FormMessage />
            </div>
            <NumberField class="gap-2" :min="0" :format-options="{
              style: 'currency',
              currency: 'COP',
              currencyDisplay: 'symbol',
              currencySign: 'accounting',
              trailingZeroDisplay: 'stripIfInteger',
              useGrouping: true,
              signDisplay: 'auto',
            }" :model-value="value" @update:model-value="
              (v) => {
                if (v) {
                  props.form.setFieldValue('price', v);
                } else {
                  props.form.setFieldValue('price', 0);
                }
              }
            ">
              <NumberFieldContent>
                <NumberFieldDecrement />
                <FormControl>
                  <NumberFieldInput />
                </FormControl>
                <NumberFieldIncrement />
              </NumberFieldContent>
            </NumberField>

          </FormItem>
        </FormField>
      </div>

      <div class="grid w-full items-center gap-4">
        <FormField v-slot="{ componentField }" name="brand">
          <FormItem class="flex flex-col">
            <div class='flex gap-1 h-4'>
              <FormLabel>Marca</FormLabel>
              <FormMessage />
            </div>
            <FormControl>
              <Popover v-model:open="props.form.brandOpen.value">
                <PopoverTrigger as-child>
                  <Button type="button" variant="outline" class="w-full justify-between">
                    {{ componentField.modelValue || 'Seleccione una marca' }}
                    <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent class="p-0">
                  <Command>
                    <CommandInput placeholder="Search brand..." v-model="props.form.brandSearchTerm2.value"
                      @keydown.enter.prevent="props.form.createBrand" />
                    <div v-if="
                      props.form.brandSearchTerm2 &&
                      !props.form.filteredBrands.value.includes(props.form.brandSearchTerm2.value)
                    "
                      class="relative flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none">
                      <Button type="button" variant="ghost" size="sm" class="w-full justify-start"
                        @click="props.form.createBrand">
                        <Plus class="mr-2 h-4 w-4" />
                        Crear "{{ props.form.brandSearchTerm2.value }}"
                      </Button>
                    </div>
                    <CommandList>
                      <CommandEmpty>No se encontraron marcas...</CommandEmpty>
                      <CommandGroup>
                        <CommandItem v-for="brand in props.form.filteredBrands.value" :key="brand" :value="brand"
                          @select="() => componentField.onChange(brand)">
                          <span>{{ brand }}</span>
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </FormControl>
          </FormItem>
        </FormField>

        <FormField v-slot="{ value }" name="category">
          <FormItem class="flex flex-col">
            <div class='flex gap-1 h-4'>
              <FormLabel>Categorías</FormLabel>
              <FormMessage />
            </div>
            <Popover v-model:open="props.form.categoryOpen.value">
              <PopoverTrigger as-child>
                <FormControl>
                  <Button type="button" variant="outline" role="combobox" :aria-expanded="props.form.categoryOpen.value"
                    class="h-auto min-h-10 w-full justify-start">
                    <div class="flex flex-1 flex-wrap gap-1.5">
                      <template v-if="!value || value.length === 0">
                        <span class="text-muted-foreground">
                          Seleccionar categorías...
                        </span>
                      </template>
                      <template v-else>
                        <Badge v-for="item in value" :key="`${item}-badges`" variant="secondary" class="gap-1">
                          <span>
                            {{ item }}
                          </span>
                        </Badge>
                      </template>
                    </div>
                    <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent class="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar categorías..." v-model="props.form.categorySearchTerm.value" />

                  <div v-if="
                    props.form.categorySearchTerm.value &&
                    !props.form.filteredCategories.value.includes(props.form.categorySearchTerm.value)
                  "
                    class="relative flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none">
                    <Button type="button" variant="ghost" size="sm" class="w-full justify-start"
                      @click="props.form.createCategory">
                      <Plus class="mr-2 h-4 w-4" />
                      Crear "{{ props.form.categorySearchTerm.value }}"
                    </Button>
                  </div>
                  <CommandList>
                    <CommandEmpty>
                      <p class="text-muted-foreground py-6 text-center text-sm">
                        No se encontraron categorías
                      </p>
                    </CommandEmpty>
                    <CommandGroup>
                      <CommandItem v-for="category in props.form.filteredCategories" :key="category!" :value="category!"
                        @select="props.form.handleCategoryToggle(category!)">
                        <Check :class="cn(
                          'mr-2 h-4 w-4',
                          value?.includes(category)
                            ? 'opacity-100'
                            : 'opacity-0'
                        )
                          " />
                        {{ category }}
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" class="w-full" name="description">
          <FormItem class="w-full">
            <div class='flex gap-1 h-4'>
              <FormLabel>Descripción</FormLabel>
              <FormMessage />
            </div>
            <FormControl>
              <Textarea type="text" placeholder="Descripción" v-bind="componentField" />
            </FormControl>
          </FormItem>
        </FormField>
      </div>

    </CardContent>

    <!-- <CardFooter> -->
    <!--   <template v-if="props.variant === 'EDIT'"> -->
    <!--     <Button type="submit" class="" :disabled="isSubmitting"> -->
    <!--       <span v-if="isSubmitting" class="flex items-center"> -->
    <!--         <Spinner class="mr-2" /> -->
    <!--         'Actualizando producto...' -->
    <!--       </span> -->
    <!--       <span v-else> -->
    <!--         {{ -->
    <!--           props.variant === 'EDIT' ? 'Actualizar producto' : 'Crear producto' -->
    <!--         }} -->
    <!--       </span> -->
    <!--     </Button> -->
    <!--   </template> -->
    <!-- </CardFooter> -->

  </Card>
</template>
