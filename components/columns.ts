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
        () => String(row.getValue('title'))
      ),
  },

  {
    accessorKey: 'brand',
    header: () => h('div', { class: 'text-left' }, 'Marca'),
    cell: ({ row }) => h('div', { class: 'capitalize' }, row.getValue('brand')),
  },
  {
    accessorKey: 'category',
    header: () => h('div', { class: 'text-left' }, 'Categorías'),

    cell: ({ row }) => {
      const categories = row.getValue('category') as string[];
      return h(
        'div',
        {
          class: 'capitalize',
        },
        categories.join(', ')
      );
    },
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
