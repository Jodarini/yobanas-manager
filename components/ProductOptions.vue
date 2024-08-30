<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import DialogClose from "./ui/dialog/DialogClose.vue";

defineProps<{
  id: number;
}>();

const store = useProductsStore();
const deleteProduct = (productId: number) => {
  store.deleteProduct(productId);
};
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger
      ><svg
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
        >
      </svg>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem>Editar</DropdownMenuItem>
      <DropdownMenuItem>
        <Dialog>
          <DialogTrigger @click.stop> Borrar </DialogTrigger>
          <DialogContent class="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                ¿Está seguro de que desea eliminar este elemento?
              </DialogTitle>
              <DialogDescription>
                Esta acción es irreversible.
              </DialogDescription>
            </DialogHeader>
            <div class="flex items-center justify-between space-x-2">
              <DialogClose as-child>
                <Button size="sm" class="px-3"> Cancelar </Button>
              </DialogClose>
              <DialogClose as-child>
                <Button
                  variant="destructive"
                  size="sm"
                  @click="deleteProduct(id)"
                >
                  Confirmar
                </Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
