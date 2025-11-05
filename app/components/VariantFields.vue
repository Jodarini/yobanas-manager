<script setup lang="ts">

const props = defineProps<{
  form: ReturnType<typeof useVariantsFormState>;
}>();

</script>

<template>
  <Card>
    <CardHeader class="flex flex-col justify-between pb-0 md:flex-row ">
      <CardTitle class="text-xl font-semibold">Variantes</CardTitle>
      <Button type="button" variant="outline" class="mt-4 flex w-full gap-2 md:mt-0 md:w-fit"
        @click.prevent="props.form.addVariant">
        <PlusCircleIcon />
        Agregar variante
      </Button>
    </CardHeader>

    <CardContent>
      <ItemGroup>
        <template v-for="(_, index) in props.form.values.variants" :key="`new-${index}`">
          <Item class="flex flex-col p-0 py-4 md:flex-row">
            <ItemContent class="flex w-full gap-4 md:flex-row ">

              <FormField v-slot="{ componentField }" :name="`variants[${index}].id`">
                <FormControl>
                  <Input type="hidden" v-bind="componentField" />
                </FormControl>
              </FormField>

              <FormField v-slot="{ componentField }" class="w-full" :name="`variants[${index}].size`">
                <FormItem class="w-full">
                  <div class='flex gap-1 h-4'>
                    <FormLabel>Talla</FormLabel>
                  </div>
                  <FormControl>
                    <Input type="text" placeholder="Tamaño" v-bind="componentField" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" class="w-full" :name="`variants[${index}].color`">
                <FormItem class="w-full">
                  <div class='flex gap-1 h-4'>
                    <FormLabel>Color</FormLabel>
                  </div>
                  <FormControl>
                    <Input type="text" placeholder="Color" v-bind="componentField" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" class="w-full" :name="`variants[${index}].stock`">
                <FormItem class="w-full">
                  <div class='flex gap-1 h-4'>
                    <FormLabel>Stock</FormLabel>
                  </div>

                  <FormControl>
                    <Input type="number" step="1" placeholder="0" v-bind="componentField" />
                  </FormControl>
                </FormItem>
                <FormMessage />
              </FormField>


              <Button type="button" class="w-fit md:self-end" variant="ghost" disabled
                @click.prevent="props.form.removeVariant(index)">
                <Trash2Icon class="text-destructive dark:text-destructive-foreground" />
              </Button>
            </ItemContent>
          </Item>

          <FormField v-slot="{ componentField, errors }" :name="`variants[${index}]`" class="mb-4">
            <FormControl class="hidden" />
            <FormMessage v-if="errors" class="mb-4" />
          </FormField>
          <ItemSeparator v-if="index !== props.form.values.variants?.length! - 1" />
        </template>
      </ItemGroup>


    </CardContent>
    <!-- <CardFooter> -->
    <!--   <Button type="submit" :disabled="props.form.isSubmitting || !props.form.meta.value.dirty"> -->
    <!--     <span v-if="props.form.isSubmitting" class="flex items-center"> -->
    <!--       <Spinner class="mr-2" /> -->
    <!--       {{ -->
    <!--         props.variant === 'EDIT' -->
    <!--           ? 'Actualizando producto...' -->
    <!--           : 'Creando producto...' -->
    <!--       }} -->
    <!--     </span> -->
    <!--     <span v-else> -->
    <!--       {{ -->
    <!--         props.variant === 'EDIT' ? 'Actualizar variantes' : 'Crear variantes' -->
    <!--       }} -->
    <!--     </span> -->
    <!--   </Button> -->
    <!-- </CardFooter> -->
  </Card>
</template>
