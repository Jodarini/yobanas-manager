<script setup lang="ts">
  import { MoreHorizontal } from 'lucide-vue-next';
  import { Button } from '@/components/ui/button';
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from '@/components/ui/dropdown-menu';
  import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from '@/components/ui/alert-dialog';
  import type { Product } from '~~/db/schema';

  const props = defineProps<{
    product: Product;
  }>();

  // function copy() {
  //   navigator.clipboard.writeText(props.product.id.toString());
  // }

  async function deleteProduct() {
    await $fetch(`/api/product/${props.product.id}`, {
      method: 'DELETE',
    });
    await refreshNuxtData('products');
  }
</script>

<template>
  <AlertDialog>
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="ghost" class="h-8 w-8 p-0">
          <span class="sr-only">Open menu</span>
          <MoreHorizontal class="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <NuxtLink as-child :to="`/product/${props.product.id}`">
            Ver producto
          </NuxtLink>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <AlertDialogTrigger as-child>
          <DropdownMenuItem
            variant="destructive"
            @select="(e: Event) => e.preventDefault()"
          >
            Borrar producto
          </DropdownMenuItem>
        </AlertDialogTrigger>
      </DropdownMenuContent>
    </DropdownMenu>

    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
        <AlertDialogDescription>
          Esta acción marcará el producto "{{ product.title }}" como eliminado.
          Ya no será visible en tu inventario.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancelar</AlertDialogCancel>
        <AlertDialogAction
          class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          @click="deleteProduct"
        >
          Borrar producto
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
