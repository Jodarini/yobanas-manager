<script setup lang="ts">
  import { formatCurrency } from '~/lib/utils';
  import type {
    ColumnDef,
    ColumnFiltersState,
    ExpandedState,
    SortingState,
    VisibilityState,
  } from '@tanstack/vue-table';
  import {
    FlexRender,
    getCoreRowModel,
    getExpandedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useVueTable,
  } from '@tanstack/vue-table';

  import { h, ref } from 'vue';
  import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
  } from '@/components/ui/dropdown-menu';
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
  // import { Checkbox } from '@/components/ui/checkbox';
  import { Button } from './ui/button';
  import { valueUpdater } from '@/lib/utils';
  import { ArrowUpDown, Badge } from 'lucide-vue-next';
  import type { Sale } from '~~/db/schema';
  import { NuxtLink } from '#components';

  const props = defineProps<{
    data: any[];
  }>();

  const columns: ColumnDef<Sale>[] = [
    // {
    //   id: 'select',
    //   header: ({ table }) =>
    //     h(Checkbox, {
    //       modelValue:
    //         table.getIsAllPageRowsSelected() ||
    //         (table.getIsSomePageRowsSelected() && 'indeterminate'),
    //       'onUpdate:modelValue': (value) =>
    //         table.toggleAllPageRowsSelected(!!value),
    //       ariaLabel: 'Select all',
    //     }),
    //   cell: ({ row }) =>
    //     h(Checkbox, {
    //       modelValue: row.getIsSelected(),
    //       'onUpdate:modelValue': (value) => row.toggleSelected(!!value),
    //       ariaLabel: 'Select row',
    //     }),
    //   enableSorting: false,
    //   enableHiding: false,
    // },
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => h('div', { class: 'capitalize' }, row.getValue('id')),
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }) => {
        const status = row.getValue('status');
        const statusClasses = {
          paid: 'bg-primary text-foreground',
          pending: 'bg-yellow-100 text-yellow-800',
          failed: 'bg-destructive text-foreground',
        };

        return h(
          Badge,
          { class: `capitalize ${statusClasses[status]}` },
          () => row.getValue('status') // Wrap in arrow function
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => {
        return h(
          Button,
          {
            variant: 'ghost',
            onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
          },
          () => ['Fecha', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })]
        );
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue('created_at'));
        const formatted = new Intl.DateTimeFormat('es-CO', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(date);
        return h('div', { class: 'lowercase' }, formatted);
      },
    },
    {
      accessorKey: 'total_amount',
      header: ({ column }) => {
        return h(
          Button,
          {
            class: 'float-end',
            variant: 'ghost',
            onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
          },
          () => ['Total', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })]
        );
      },
      cell: ({ row }) => {
        const amount = Number.parseFloat(row.getValue('total_amount'));

        // Format the amount as a dollar amount
        const formatted = formatCurrency(amount);

        return h('div', { class: 'text-right font-medium' }, formatted);
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const sale = row.original;

        return h(
          'div',
          { class: 'relative text-center' },
          h(
            Button,
            { variant: 'outline', 'as-child': true },
            {
              default: () =>
                h(
                  NuxtLink,
                  {
                    to: `/sales/${sale.id}`,
                  },
                  {
                    default: () => 'Ver',
                  }
                ),
            }
          )
        );
      },
    },

    // {
    //   id: 'actions',
    //   enableHiding: false,
    //   cell: ({ row }) => {
    //     const payment = row.original;
    //
    //     return h(
    //       'div',
    //       { class: 'relative' },
    //       h(DropdownAction, {
    //         payment,
    //         onExpand: row.toggleExpanded,
    //       })
    //     );
    //   },
    // },
  ];

  const sorting = ref<SortingState>([]);
  const columnFilters = ref<ColumnFiltersState>([]);
  const columnVisibility = ref<VisibilityState>({});
  const rowSelection = ref({});
  const expanded = ref<ExpandedState>({});

  const table = useVueTable({
    get data() {
      return props.data;
    },
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onSortingChange: (updaterOrValue) => valueUpdater(updaterOrValue, sorting),
    onColumnFiltersChange: (updaterOrValue) =>
      valueUpdater(updaterOrValue, columnFilters),
    onColumnVisibilityChange: (updaterOrValue) =>
      valueUpdater(updaterOrValue, columnVisibility),
    state: {
      get sorting() {
        return sorting.value;
      },
      get columnFilters() {
        return columnFilters.value;
      },
      get columnVisibility() {
        return columnVisibility.value;
      },
      get rowSelection() {
        return rowSelection.value;
      },
      get expanded() {
        return expanded.value;
      },
    },
  });
</script>

<template>
  <div class="w-full">
    <div class="flex items-center gap-2 py-4">
      <Input
        class="max-w-sm"
        placeholder="Filtrar ventas"
        :model-value="table.getColumn('created_at')?.getFilterValue() as string"
        @update:model-value="
          table.getColumn('created_at')?.setFilterValue($event)
        "
      />
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline" class="ml-auto">
            Columnas
            <ChevronDown class="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuCheckboxItem
            v-for="column in table
              .getAllColumns()
              .filter((column) => column.getCanHide())"
            :key="column.id"
            class="capitalize"
            :model-value="column.getIsVisible()"
            @update:model-value="
              (value) => {
                column.toggleVisibility(!!value);
              }
            "
          >
            {{ column.id }}
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    <div class="border-border rounded-md">
      <Table>
        <TableHeader>
          <TableRow
            v-for="headerGroup in table.getHeaderGroups()"
            :key="headerGroup.id"
          >
            <TableHead v-for="header in headerGroup.headers" :key="header.id">
              <FlexRender
                v-if="!header.isPlaceholder"
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="table.getRowModel().rows?.length">
            <template v-for="row in table.getRowModel().rows" :key="row.id">
              <TableRow :data-state="row.getIsSelected() && 'selected'">
                <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                  <FlexRender
                    :render="cell.column.columnDef.cell"
                    :props="cell.getContext()"
                  />
                </TableCell>
              </TableRow>
              <TableRow v-if="row.getIsExpanded()">
                <TableCell :colspan="row.getAllCells().length">
                  {{ JSON.stringify(row.original) }}
                </TableCell>
              </TableRow>
            </template>
          </template>

          <TableRow v-else>
            <TableCell :colspan="columns.length" class="h-24 text-center">
              Sin ventas.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <div class="flex items-center justify-end space-x-2 py-4">
      <!-- <div class="text-muted-foreground flex-1 text-sm"> -->
      <!--   {{ table.getFilteredSelectedRowModel().rows.length }} of -->
      <!--   {{ table.getFilteredRowModel().rows.length }} row(s) selected. -->
      <!-- </div> -->
      <div class="space-x-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="!table.getCanPreviousPage()"
          @click="table.previousPage()"
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="!table.getCanNextPage()"
          @click="table.nextPage()"
        >
          Siguiente
        </Button>
      </div>
    </div>
  </div>
</template>
