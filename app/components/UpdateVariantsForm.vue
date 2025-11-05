<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useToast } from './ui/toast';
import { updateVariantSchema, type UpdateVariant } from '~~/db/schema';
import { useForm } from 'vee-validate';
import { Trash2Icon, PlusCircleIcon } from 'lucide-vue-next';

const props = defineProps<{
  data?: UpdateVariant;
  isDeleting?: boolean;
  variant: 'ADD' | 'EDIT';
}>();

const formSchema = toTypedSchema(updateVariantSchema);

const { handleSubmit, values, setFieldValue, resetForm, isSubmitting } =
  useForm({
    validationSchema: formSchema,
    initialValues: {
      variants: props.data?.variants || [{
        color: 'test',
        size: 'test',
        stock: 1,
      }]
    }
  });

const route = useRoute()
const { toast } = useToast();

const onSubmit = handleSubmit(
  async (values) => {
    $fetch(`/api/product/${route.params.id}/updateVariant`, {
      method: 'put',
      body: {
        variants: values.variants, productSKU: props.data?.productSKU
      },
    })
    if (props.variant === 'ADD') {
      resetForm();
    }
  },
  ({ errors }) => {
    toast({
      variant: 'destructive',
      title: 'Error en el formulario',
      description: 'Verifique los campos marcados en rojo',
    });
    console.error(errors);
  }
);

const addVariant = () => {
  const currentVariants = values.variants || [];
  const newVariant = {
    size: '',
    color: '',
    stock: 0,
  };

  setFieldValue('variants', [...currentVariants, newVariant]);
};

const removeVariant = (index: number) => {
  const currentVariants = [...(values.variants || [])];
  currentVariants.splice(index, 1);
  setFieldValue('variants', currentVariants);
};
</script>

<template>
  <Card>
    <form @submit.prevent="onSubmit">
      <CardHeader class="flex flex-col justify-between pb-0 md:flex-row ">
        <CardTitle class="text-xl font-semibold">Variantes</CardTitle>
        <Button type="button" variant="outline" class="mt-4 flex w-full gap-2 md:mt-0 md:w-fit"
          @click.prevent="addVariant">
          <PlusCircleIcon />
          Agregar variante
        </Button>
      </CardHeader>

      <CardContent>
        <ItemGroup>
          <template v-for="(_, index) in values.variants" :key="`new-${index}`">
            <Item class="flex flex-col p-0 py-4 md:flex-row">
              <ItemContent class="flex w-full gap-4 md:flex-row ">

                <FormField v-slot="{ componentField }" :name="`variants[${index}].id`">
                  <FormControl>
                    <input type="hidden" v-bind="componentField" />
                  </FormControl>
                </FormField>

                <FormField v-slot="{ componentField }" class="w-full" :name="`variants[${index}].size`">
                  <FormItem class="w-full">
                    <div class='flex gap-1 h-4'>
                      <FormLabel>Talla</FormLabel>
                      <FormMessage />
                    </div>
                    <FormControl>
                      <Input type="text" placeholder="Tamaño" v-bind="componentField" />
                    </FormControl>
                  </FormItem>
                </FormField>

                <FormField v-slot="{ componentField }" class="w-full" :name="`variants[${index}].color`">
                  <FormItem class="w-full">
                    <div class='flex gap-1 h-4'>
                      <FormLabel>Color</FormLabel>
                      <FormMessage />
                    </div>
                    <FormControl>
                      <Input type="text" placeholder="Color" v-bind="componentField" />
                    </FormControl>
                  </FormItem>
                </FormField>

                <FormField v-slot="{ componentField }" class="w-full" :name="`variants[${index}].stock`">
                  <FormItem class="w-full">
                    <div class='flex gap-1 h-4'>
                      <FormLabel>Stock</FormLabel>
                      <FormMessage />
                    </div>

                    <FormControl>
                      <Input type="number" step="1" placeholder="0" v-bind="componentField" />
                    </FormControl>
                  </FormItem>
                </FormField>

                <Button type="button" class="w-fit md:self-end" variant="ghost" disabled
                  @click.prevent="removeVariant(index)">
                  <Trash2Icon class="text-destructive dark:text-destructive-foreground" />
                </Button>
              </ItemContent>
            </Item>
            <ItemSeparator v-if="index !== values.variants?.length! - 1" />
          </template>
        </ItemGroup>


      </CardContent>
      <CardFooter>
        <Button type="submit" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="flex items-center">
            <Spinner class="mr-2" />
            {{
              props.variant === 'EDIT'
                ? 'Actualizando producto...'
                : 'Creando producto...'
            }}
          </span>
          <span v-else>
            {{
              props.variant === 'EDIT' ? 'Actualizar variantes' : 'Crear variantes'
            }}
          </span>
        </Button>
      </CardFooter>
    </form>
  </Card>
</template>
