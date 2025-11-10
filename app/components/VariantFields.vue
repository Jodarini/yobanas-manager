<script setup lang="ts">
  import { Trash2Icon, PlusCircleIcon } from 'lucide-vue-next';

  const props = defineProps<{
    form:
      | ReturnType<typeof useVariantsFormState>
      | ReturnType<typeof useProductWithVariants>;
    mode: 'ADD' | 'EDIT';
  }>();
</script>

<template>
  <Card class="min-h-full flex-2">
    <CardHeader class="flex flex-col justify-between pb-0 md:flex-row">
      <CardTitle class="text-xl font-semibold">Variantes</CardTitle>
      <Button
        type="button"
        variant="outline"
        class="mt-4 flex w-full gap-2 md:mt-0 md:w-fit"
        @click.prevent="props.form.addVariant"
      >
        <PlusCircleIcon />
        Agregar variante
      </Button>
    </CardHeader>

    <CardContent>
      <ItemGroup>
        <template
          v-for="(_, index) in props.form.values.variants"
          :key="`new-${index}`"
        >
          <Item class="flex flex-col p-0 py-4 md:flex-row">
            <ItemContent class="flex w-full gap-4 md:flex-row">
              <!-- Hidden ID field -->
              <FormField
                v-slot="{ componentField }"
                :name="`variants[${index}].id`"
              >
                <FormItem>
                  <FormControl>
                    <Input type="hidden" v-bind="componentField" />
                  </FormControl>
                </FormItem>
              </FormField>

              <!-- Size field -->
              <FormField
                v-slot="{ componentField }"
                class="w-full"
                :name="`variants[${index}].size`"
              >
                <FormItem class="w-full">
                  <div class="flex h-4 gap-1">
                    <FormLabel>Talla</FormLabel>
                  </div>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Tamaño"
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <!-- Color field -->
              <FormField
                v-slot="{ componentField }"
                class="w-full"
                :name="`variants[${index}].color`"
              >
                <FormItem class="w-full">
                  <div class="flex h-4 gap-1">
                    <FormLabel>Color</FormLabel>
                  </div>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Color"
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <!-- Stock field - FormMessage moved inside FormItem -->
              <FormField
                v-slot="{ componentField }"
                class="w-full"
                :name="`variants[${index}].stock`"
              >
                <FormItem class="w-full">
                  <div class="flex h-4 gap-1">
                    <FormLabel>Stock</FormLabel>
                  </div>
                  <FormControl>
                    <Input
                      type="number"
                      step="1"
                      placeholder="0"
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <Button
                type="button"
                class="w-fit md:self-end"
                variant="ghost"
                disabled
                @click.prevent="props.form.removeVariant(index)"
              >
                <Trash2Icon
                  class="text-destructive dark:text-destructive-foreground"
                />
              </Button>
            </ItemContent>
          </Item>

          <FormField
            v-slot="{ errors }"
            :name="`variants[${index}]`"
            class="mb-4"
          >
            <FormItem>
              <FormControl class="hidden" />
              <FormMessage v-if="errors" class="mb-4" />
            </FormItem>
          </FormField>
          <ItemSeparator
            v-if="index !== props.form.values.variants?.length! - 1"
          />
        </template>
      </ItemGroup>
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
            Actualizando variantes...
          </template>
          <template v-else>Actualizar variantes</template>
        </Button>
      </template>
    </CardFooter>
  </Card>
</template>
