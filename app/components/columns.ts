import type { ColumnDef } from '@tanstack/vue-table';
import type { Product } from '~~/db/schema';
import { h } from 'vue';
import { NuxtLink } from '#components';
import DataTableDropDown from './DataTableDropDown.vue';

export const columns: ColumnDef<Product>[] = [
  // {
  //   accessorKey: 'sku',
  //   header: () => h('div', { class: 'text-left' }, 'SKU'),
  //   cell: ({ row }) =>
  //     h(
  //       NuxtLink,
  //       {
  //         class: 'capitalize font-medium',
  //         to: `/products/${row.original.id}`,
  //       },
  //       () => String(row.getValue('sku'))
  //     ),
  // },
  {
    accessorKey: 'created_at',
    header: 'Date Sort',
    enableHiding: true,
    // This column will be hidden by default
  },
  {
    accessorKey: 'title',
    header: () => h('div', { class: 'text-left' }, 'Nombre'),
    cell: ({ row }) =>
      h(
        NuxtLink,
        {
          class: 'capitalize font-medium',
          to: `/products/${row.original.id}`,
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
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const product = row.original;

      return h(
        'div',
        { class: 'relative' },
        h(DataTableDropDown, {
          product,
          onExpand: row.toggleExpanded,
        })
      );
    },
  },
  // {
  //   accessorKey: 'stock',
  //   header: () => h('div', { class: 'text-left' }, 'Stock'),
  //   cell: ({ row }) => h('div', { class: 'capitalize' }, row.getValue('stock')),
  // },
];
