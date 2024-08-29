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

const formSchema = toTypedSchema(
  z.object({
    nombre: z
      .string()
      .min(2, { message: "El nombre es requerido" })
      .max(50, { message: "Debe tener maximo 50 caracteres" }),
    description: z.string().max(100, { message: "Maximo 100 caracteres" }),
    price: z.number().min(1, { message: "El precio es requerido" }),
    brand: z
      .string()
      .min(2, { message: "La marca es requerida" })
      .max(50, { message: "Debe tener maximo 50 caracteres" }),
    category: z
      .string()
      .min(2, { message: "La marca es requerida" })
      .max(50, { message: "Debe tener maximo 50 caracteres" }),
    thumbnail: z.string().url({ message: "Enlace invalido" }),
  }),
);

const { handleSubmit, resetForm } = useForm({
  validationSchema: formSchema,
});

const store = useProductsStore();

const onSubmit = handleSubmit((values) => {
  alert(JSON.stringify(values));
  resetForm();
  console.log(store.addProduct());
});
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
          <FormField v-slot="{ componentField }" name="nombre">
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
                />
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
