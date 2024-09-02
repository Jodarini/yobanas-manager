<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Input } from "./ui/input";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useForm } from "vee-validate";
import { useToast } from "./ui/toast/use-toast";

const { toast } = useToast();
const isOpen = ref<boolean | undefined>();

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

const { handleSubmit, resetForm } = useForm({
  validationSchema: formSchema,
  initialValues: {
    title: "Colby Extra-Small Burnished Leather Shoulder Bag ",
    category: "Handbags",
    description:
      "100% leather from tanneries meeting the highest standards of environmental performance",
    tags: "women",
    stock: 1,
    brand: "Michael Kors",
    price: 228,
    thumbnail:
      "https://michaelkors.scene7.com/is/image/MichaelKors/32F4ABAU0T-0201_1?$zoom$",
  },
});

const store = useProductsStore();

const onSubmit = handleSubmit(async (values) => {
  const newTags = values.tags?.split(",");
  const newCategories = values.category?.split(",");

  const product = {
    ...values,
    tags: newTags,
    category: newCategories,
  };

  try {
    const { data, error } = await useFetch("/api/product/add", {
      method: "post",
      body: { product },
    });

    if (error.value) {
      throw new Error(error.value.message);
    }
    if (data.value) {
      store.addProduct(data.value);
      toast({
        title: `Producto agregado: ${data.value.title}`,
      });
    }
  } catch (err) {
    toast({
      variant: "destructive",
      title: `${err}`,
    });
    console.error(err);
  } finally {
    isOpen.value = false;
    resetForm();
  }
});
</script>
<template>
  <Sheet :open="isOpen">
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
            <!-- TODO: Add Tags Input from shadcn-vue -->
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <FormControl>
                <Input
                  required
                  type="text"
                  placeholder="Categoria"
                  v-bind="componentField"
                />
                <Button type="button">Add</Button>
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
        <SheetClose as-child />
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>

<style scoped></style>
