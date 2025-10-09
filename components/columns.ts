import type { ColumnDef } from '@tanstack/vue-table';
import type { Payment } from '@/components/columns';
import { h } from 'vue';
import { NuxtLink } from '#components';

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: 'title',
    header: () => h('div', { class: 'text-left' }, 'Nombre'),
    cell: ({ row }) =>
      h(
        NuxtLink,
        {
          class: 'capitalize font-medium',
          to: `/product/${row.original.id}`,
        },
        () => row.getValue('title') // function slot, not raw value
      ),
  },
  {
    accessorKey: 'category',
    header: () => h('div', { class: 'text-left' }, 'Categoría'),
    cell: ({ row }) =>
      h('div', { class: 'capitalize' }, row.getValue('category')),
  },
  {
    accessorKey: 'price',
    header: () => h('div', { class: 'text-left' }, 'Precio'),
    cell: ({ row }) => h('div', { class: 'capitalize' }, row.getValue('price')),
  },
  // {
  //   accessorKey: 'stock',
  //   header: () => h('div', { class: 'text-left' }, 'Stock'),
  //   cell: ({ row }) => h('div', { class: 'capitalize' }, row.getValue('stock')),
  // },
];
