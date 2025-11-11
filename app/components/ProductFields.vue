<script setup lang="ts">
  import { cn } from '@/lib/utils';
  import type { ComponentFieldBindingObject } from 'vee-validate';

  const props = defineProps<{
    form:
      | ReturnType<typeof useProductWithVariants>
      | ReturnType<typeof useProductFormState>;
    mode: 'ADD' | 'EDIT';
    isDeleted: boolean;
  }>();

  const brandOpen = defineModel<boolean>('brandOpen');
  const categoryOpen = defineModel<boolean>('categoryOpen');
  const brandSearchTerm = defineModel<string>('brandSearchTerm');
  const categorySearchTerm = defineModel<string>('categorySearchTerm');

  const handleCategoryToggle = (
    category: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    componentField: ComponentFieldBindingObject<any>
  ) => {
    const selectedCategories = componentField.modelValue || [];
    const isCategorySelected = selectedCategories.includes(category);

    const updatedCategories = isCategorySelected
      ? selectedCategories.filter((cat: string) => cat !== category)
      : [...selectedCategories, category];

    componentField['onUpdate:modelValue']!(updatedCategories);
  };
</script>

<template>
  <Card class="min-h-full flex-1">
    <!-- Product Info Fields -->
    <CardHeader>
      <CardTitle>Información del Producto</CardTitle>
    </CardHeader>

    <CardContent>
      <div class="grid w-full items-center gap-4">
        <FormField v-slot="{ componentField }" class="flex-1" name="title">
          <FormItem class="w-full">
            <div class="flex h-4 gap-1">
              <FormLabel>Nombre</FormLabel>
              <FormMessage />
            </div>
            {{ isDeleted }}
            <FormControl>
              <Input
                type="text"
                placeholder="Nombre del producto"
                v-bind="componentField"
                :disabled="isDeleted"
              />
            </FormControl>
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField, value }" name="price">
          <FormItem class="w-full">
            <div class="flex h-4 gap-1">
              <FormLabel>Precio</FormLabel>
              <FormMessage />
            </div>
            <NumberField
              class="gap-2"
              :min="0"
              :format-options="{
                style: 'currency',
                currency: 'COP',
                currencyDisplay: 'symbol',
                currencySign: 'accounting',
                trailingZeroDisplay: 'stripIfInteger',
                useGrouping: true,
                signDisplay: 'auto',
              }"
              :disabled="isDeleted"
              :model-value="value"
              @update:model-value="componentField['onUpdate:modelValue']"
            >
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

        <FormField v-slot="{ componentField }" name="brand">
          <FormItem class="flex flex-col">
            <div class="flex h-4 gap-1">
              <FormLabel>Marca</FormLabel>
              <FormMessage />
            </div>
            <FormControl>
              <Popover v-model:open="brandOpen">
                <PopoverTrigger as-child>
                  <Button
                    type="button"
                    variant="outline"
                    class="w-full justify-between"
                    :disabled="isDeleted"
                  >
                    {{ componentField.modelValue || 'Seleccione una marca' }}
                    <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent class="p-0">
                  <Command>
                    <CommandInput
                      v-model="brandSearchTerm"
                      placeholder="Search brand..."
                      @keydown.enter.prevent="props.form.createBrand"
                    />
                    <div
                      v-if="
                        brandSearchTerm &&
                        !props.form.filteredBrands.value.includes(
                          brandSearchTerm
                        )
                      "
                      class="relative flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        class="w-full justify-start"
                        @click="props.form.createBrand"
                      >
                        <Plus class="mr-2 h-4 w-4" />
                        Crear "{{ brandSearchTerm }}"
                      </Button>
                    </div>
                    <CommandList>
                      <CommandEmpty>No se encontraron marcas...</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          v-for="brand in props.form.filteredBrands.value"
                          :key="brand"
                          :value="brand"
                          @select="() => componentField.onChange(brand)"
                        >
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

        <FormField v-slot="{ componentField }" name="category">
          <FormItem class="flex flex-col">
            <div class="flex h-4 gap-1">
              <FormLabel>Categorías</FormLabel>
              <FormMessage />
            </div>
            <Popover v-model:open="categoryOpen">
              <PopoverTrigger as-child>
                <FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    :aria-expanded="categoryOpen"
                    class="h-auto min-h-10 w-full justify-start"
                    :disabled="isDeleted"
                  >
                    <div class="flex flex-1 flex-wrap gap-1.5">
                      <template
                        v-if="
                          !componentField.modelValue ||
                          componentField.modelValue.length === 0
                        "
                      >
                        <span class="text-muted-foreground">
                          Seleccionar categorías...
                        </span>
                      </template>
                      <template v-else>
                        <Badge
                          v-for="item in componentField.modelValue"
                          :key="`cat-${item}`"
                          variant="secondary"
                          class="gap-1"
                        >
                          <span>{{ item }}</span>
                        </Badge>
                      </template>
                    </div>
                    <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent class="w-full p-0" align="start">
                <Command>
                  <CommandInput
                    v-model="categorySearchTerm"
                    placeholder="Buscar categorías..."
                  />

                  <div
                    v-if="
                      categorySearchTerm &&
                      !props.form.filteredCategories.value.includes(
                        categorySearchTerm
                      )
                    "
                    class="relative flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      class="w-full justify-start"
                      @click="props.form.createCategory"
                    >
                      <Plus class="mr-2 h-4 w-4" />
                      Crear "{{ categorySearchTerm }}"
                    </Button>
                  </div>

                  <CommandList>
                    <CommandEmpty>
                      <p class="text-muted-foreground py-6 text-center text-sm">
                        No se encontraron categorías
                      </p>
                    </CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        v-for="category in props.form.filteredCategories.value"
                        :key="category!"
                        :value="category!"
                        @select="handleCategoryToggle(category, componentField)"
                      >
                        <Check
                          :class="
                            cn(
                              'mr-2 h-4 w-4',
                              componentField.modelValue?.includes(category)
                                ? 'opacity-100'
                                : 'opacity-0'
                            )
                          "
                        />
                        {{ category }}
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </FormItem>
        </FormField>

        <FormField
          v-slot="{ componentField }"
          class="w-full"
          name="description"
        >
          <FormItem class="w-full">
            <div class="flex h-4 gap-1">
              <FormLabel>Descripción</FormLabel>
              <FormMessage />
            </div>
            <FormControl>
              <Textarea
                type="text"
                placeholder="Descripción"
                v-bind="componentField"
                :disabled="isDeleted"
              />
            </FormControl>
          </FormItem>
        </FormField>
      </div>
    </CardContent>

    <CardFooter>
      <template v-if="props.mode === 'EDIT'">
        <Button
          type="submit"
          class="ml-auto"
          :disabled="
            props.form.isSubmitting.value || !props.form.meta.value.dirty
          "
        >
          <template v-if="props.form.isSubmitting.value">
            <Spinner class="mr-2" />
            Actualizando producto...
          </template>
          <template v-else>Actualizar producto</template>
        </Button>
      </template>
    </CardFooter>
  </Card>
</template>
