<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useForm } from "vee-validate";
import { useToast } from "./ui/toast/use-toast";
import { useFetch } from "#app";
import Sheet from "./ui/sheet/Sheet.vue";
import {
  TagsInput,
  TagsInputInput,
  TagsInputItem,
  TagsInputItemDelete,
  TagsInputItemText,
} from "@/components/ui/tags-input";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxInput,
  ComboboxPortal,
  ComboboxRoot,
} from "radix-vue";
import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const { toast } = useToast();

const formSchema = toTypedSchema(
  z.object({
    title: z.string().min(1, "Debe ingresar un titulo"),
    description: z.string().optional().nullable(),
    price: z
      .number({ message: "Debe ser un numero" })
      .positive("El precio debe ser positivo"),
    category: z
      .array(z.string())
      .min(1, "Debe agregar al menos una categoria")
      .max(3, "El producto debe tener maximo 3 categorias"),
    thumbnail: z
      .string()
      .url("Debe ingresar un enlace correcto")
      .optional()
      .nullable(),
    brand: z.string().min(1, "La marca debe tener al menos un caracter"),
    tags: z.string().optional().nullable(),
    stock: z
      .number({ message: "Debe ser un numero" })
      .int()
      .nonnegative("La cantidad debe ser positiva"),
  }),
);

const { handleSubmit, resetForm } = useForm({
  validationSchema: formSchema,
  initialValues: {
    title: "Colby Extra-Small Burnished Leather Shoulder Bag ",
    description:
      "100% leather from tanneries meeting the highest standards of environmental performance",
    category: [],
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
  const product = {
    ...values,
    tags: newTags,
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
    resetForm();
    modelValue.value = [];
  } catch (err) {
    toast({
      variant: "destructive",
      title: `${err}`,
    });
    console.error(err);
  }
});

const modelValue = ref<string[]>([]);
const open = ref(false);
const searchTerm = ref("");

const categories = computed(() => {
  const categories = new Set<string>([]);
  if (!store.products) return [];
  store.products.forEach((product) => {
    product.category?.forEach((cat) => categories.add(cat));
  });
  return Array.from(categories);
});

const filteredCategories = computed(() => {
  const filtered = categories.value.filter(
    (category) =>
      !modelValue.value.includes(category) &&
      category.toLowerCase().includes(searchTerm.value.toLowerCase()),
  );
  if (
    searchTerm.value &&
    !filtered.includes(searchTerm.value) &&
    !modelValue.value.includes(searchTerm.value)
  ) {
    filtered.push(searchTerm.value);
  }
  return filtered;
});

const addNewCategory = (category: string) => {
  if (!modelValue.value.includes(category)) {
    modelValue.value.push(category);
  }
  searchTerm.value = "";
  open.value = false;
};
</script>

<template>
  <Sheet @update:open="resetForm()">
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
        <form class="space-y-2" @submit.prevent="onSubmit">
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

          <FormField :model-value="modelValue" name="category">
            <FormItem>
              <FormLabel>Categorias</FormLabel>
              <FormControl>
                <TagsInput class="gap-0 px-0" :model-value="modelValue">
                  <div class="flex flex-wrap items-center gap-2 px-3">
                    <TagsInputItem
                      v-for="item in modelValue"
                      :key="item"
                      :value="item"
                    >
                      <TagsInputItemText />
                      <TagsInputItemDelete />
                    </TagsInputItem>
                  </div>
                  <ComboboxRoot
                    v-model="modelValue"
                    v-model:open="open"
                    v-model:searchTerm="searchTerm"
                    class="w-full"
                  >
                    <ComboboxAnchor as-child>
                      <ComboboxInput placeholder="Categoria..." as-child>
                        <TagsInputInput
                          class="w-full px-3"
                          :class="modelValue.length > 0 ? 'mt-2' : ''"
                          @keydown.enter.prevent
                        />
                      </ComboboxInput>
                    </ComboboxAnchor>
                    <ComboboxPortal>
                      <ComboboxContent>
                        <CommandList
                          position="popper"
                          class="z-[50] mt-2 w-[--radix-popper-anchor-width] rounded-md border bg-popover text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
                        >
                          <CommandEmpty />
                          <CommandGroup>
                            <CommandItem
                              v-for="cat in filteredCategories"
                              :key="cat"
                              :value="cat"
                              @select.prevent="addNewCategory(cat)"
                            >
                              {{ cat }}
                            </CommandItem>
                          </CommandGroup>
                        </CommandList>
                      </ComboboxContent>
                    </ComboboxPortal>
                  </ComboboxRoot>
                </TagsInput>
              </FormControl>
              <FormDescription />
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
          <Button type="submit" class="w-full">Guardar</Button>
        </form>
      </SheetHeader>
      <SheetFooter>
        <SheetClose as-child />
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
