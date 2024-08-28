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

const onSubmit = () => {};
</script>
<template>
  <Sheet>
    <SheetTrigger as-child>
      <Button variant="outline"> Agregar producto </Button>
    </SheetTrigger>
    <SheetContent side="right" class="w-[600px]">
      <form @submit="onSubmit">
        <SheetHeader>
          <SheetTitle>Agrega un producto</SheetTitle>
          <SheetDescription>
            Crea tu producto llenando los campos. Presiona guardar cuando
            termines.
          </SheetDescription>
          <FormField v-slot="{ componentField }" name="username">
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

              <FormLabel>Descripcion</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Descripcion"
                  v-bind="componentField"
                />
              </FormControl>

              <FormLabel>Precio</FormLabel>
              <FormControl>
                <Input
                  required
                  type="number"
                  placeholder="Precio"
                  v-bind="componentField"
                />
              </FormControl>

              <FormLabel>Marca</FormLabel>
              <FormControl>
                <Input
                  required
                  type="text"
                  placeholder="Marca"
                  v-bind="componentField"
                />
              </FormControl>

              <FormLabel>Categoria</FormLabel>
              <FormControl>
                <Input
                  required
                  type="text"
                  placeholder="Categoria"
                  v-bind="componentField"
                />
              </FormControl>

              <FormLabel>Imagen</FormLabel>
              <FormControl>
                <Input
                  required
                  type="text"
                  placeholder="Imagen"
                  v-bind="componentField"
                />
              </FormControl>
              <FormDescription>
                <!-- This is your public display name. -->
              </FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>
        </SheetHeader>
        <SheetFooter>
          <SheetClose as-child>
            <Button type="submit">Guardar</Button>
          </SheetClose>
        </SheetFooter>
      </form>
    </SheetContent>
  </Sheet>
</template>

<style scoped></style>
