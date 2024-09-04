<script setup lang="ts">
import { useToast } from "@/components/ui/toast/use-toast";
import { Loader2 } from "lucide-vue-next";

const props = defineProps<{
  id: number;
  title: string;
}>();

const isDeleting = ref(false);
const { toast } = useToast();
const store = useProductsStore();

const deleteProduct = async (productId: number) => {
  isDeleting.value = true;
  try {
    const { error } = await useFetch("/api/product/delete", {
      method: "delete",
      body: { id: productId },
    });
    if (error.value) {
      throw new Error(error.value.statusMessage || "Error borrando producto");
    }
    toast({
      title: `Producto eliminado: ${props.title}`,
    });
    store.products = store.products!.filter(
      (product) => product.id !== productId,
    );
  } catch (err) {
    console.error(err);

    toast({
      variant: "destructive",
      title: `${err}`,
    });
  } finally {
    isDeleting.value = false;
  }
};

const isOpen = ref(false);
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger>
      <Button variant="ghost" class="rounded-full p-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          stroke="currentColor"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          viewBox="0 0 24 24"
          data-icon="SvgMoreVertical"
          aria-hidden="true"
        >
          <path
            d="M11 20a1 1 0 11.293.707A1 1 0 0111 20zm0-8a1 1 0 11.293.707A1 1 0 0111 12zm0-8a1 1 0 11.293.707A1 1 0 0111 4z"
          ></path>
        </svg>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem>
        <Dialog v-model:open="isOpen">
          <DialogTrigger class="h-full w-full text-left" @click.stop>
            Borrar
          </DialogTrigger>
          <DialogContent class="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                ¿Está seguro de que desea eliminar este elemento?
              </DialogTitle>
              <DialogDescription>
                <span> Esta acción es irreversible. </span>
              </DialogDescription>
            </DialogHeader>

            <div class="flex items-center justify-between space-x-2">
              <DialogClose as-child>
                <Button size="sm" class="px-3"> Cancelar </Button>
              </DialogClose>
              <Button
                variant="destructive"
                size="sm"
                class="w-[10ch]"
                :disabled="isDeleting"
                @click="deleteProduct(id)"
              >
                <div v-if="isDeleting">
                  <span>
                    <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                  </span>
                </div>
                <template v-else> Confirmar </template>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
