<script setup lang="ts">
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useForm } from "vee-validate";
import type { Product } from "~/db/schema";

const formSchema = toTypedSchema(
  z.object({
    title: z.string().min(1, "Product title is required"),
    description: z.string().optional().nullable(),
    price: z.number().positive("Price must be positive"),
    category: z.string().min(1, "At least one category is required"),
    thumbnail: z
      .string()
      .url("Thumbnail must be a valid URL")
      .optional()
      .nullable(),
    brand: z.string().min(1, "La marca debe tener al menos un caracter"),
    tags: z.string().optional().nullable(),
    stock: z.number().int().nonnegative("Stock must be a non-negative integer"),
  }),
);

const { handleSubmit, resetForm, values } = useForm({
  validationSchema: formSchema,
  initialValues: {
    title: "test",
    category: "test",
    description: "test",
    tags: "test",
    stock: 1,
    brand: "test",
    price: 2,
    thumbnail: "https://placehold.co/600x400@2x.png",
  },
});

console.log(values.category);

const store = useProductsStore();

const onSubmit = handleSubmit(async (values) => {
  const newTags = values.tags?.split(",");
  const newCategories = values.category?.split(",");
  const prod = await store.addProduct({
    ...values,
    tags: newTags,
    category: newCategories,
  });
  alert({ prod });
  alert(JSON.stringify(values));
  resetForm();
});

const newCategory = ref();
const product = ref<Product>({ price: "", stock: "", title: "" });
const addCategory = () => {
  // if (
  //   newCategory.value &&
  //   !product.value.category.includes(newCategory.value)
  // ) {
  //   product.value.category.push(newCategory.value);
  //   newCategory.value = "";
  // }
};
</script>
<template>
  <Sheet>
    <SheetTrigger as-child>
      <Button variant="outline"> Agregar producto </Button>
    </SheetTrigger>
    <SheetContent side="left" class="w-[600px]">
      <SheetHeader>
        <SheetTitle>Agrega un producto</SheetTitle>
        <SheetDescription>
          Crea tu producto llenando los campos. Presiona guardar cuando
          termines.
        </SheetDescription>
        <form @submit.prevent="onSubmit">
          <FormField v-slot="{ componentField }" name="title">
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input
                  required
                  type="text"
                  placeholder="Nombre"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="description">
            <FormItem>
              <FormLabel>Descripcion</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Descripcion"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="price">
            <FormItem>
              <FormLabel>Precio</FormLabel>
              <FormControl>
                <Input
                  required
                  type="number"
                  placeholder="Precio"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="stock">
            <FormItem>
              <FormLabel>Cantidad</FormLabel>
              <FormControl>
                <Input
                  required
                  type="number"
                  placeholder="0"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="brand">
            <FormItem>
              <FormLabel>Marca</FormLabel>
              <FormControl>
                <Input
                  required
                  type="text"
                  placeholder="Marca"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="category">
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <FormControl>
                <Input
                  required
                  type="text"
                  placeholder="Categoria"
                  v-bind="componentField"
                  @keyup.enter.prevent="addCategory"
                />
                <Button type="button" @click="addCategory">Add</Button>
                {{ newCategory }}
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="thumbnail">
            <FormItem>
              <FormLabel>Imagen</FormLabel>
              <FormControl>
                <Input
                  required
                  type="text"
                  placeholder="Imagen"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormDescription>
              <!-- This is your public display name. -->
            </FormDescription>
          </FormField>
          <Button type="submit" @click="handleSubmit">Guardar</Button>
        </form>
      </SheetHeader>
      <SheetFooter>
        <SheetClose as-child> </SheetClose>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>

<style scoped></style>
