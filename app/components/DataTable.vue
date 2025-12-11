<script setup lang="ts" generic="TData, TValue">
import { cn, valueUpdater } from '@/lib/utils';
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from '@tanstack/vue-table';
import {
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useVueTable,
} from '@tanstack/vue-table';
import { ArrowUpDown, ChevronDown, CheckIcon } from 'lucide-vue-next';

import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Table,
} from '@/components/ui/table';

const props = defineProps<{
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}>();

const brands = ref<string[]>([
  ...new Set(props.data.map((product) => product.brand)),
]);
const sorting = ref<SortingState>([
  {
    id: 'created_at',
    desc: true,
  },
]);

const columnFilters = ref<ColumnFiltersState>([]);
const columnVisibility = ref<VisibilityState>({
  created_at: false, // Hide the sort column
});

const table = useVueTable({
  get data() {
    return props.data;
  },
  get columns() {
    return props.columns;
  },
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
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
  },
});
const open = ref(false);
const value = ref('');

const selectedBrand = computed(() =>
  brands.value.find((brand) => brand === value.value)
);

function selectBrand(selectedValue: string) {
  const filterValue = selectedValue === value.value ? '' : selectedValue;
  value.value = filterValue;

  table.getColumn('brand')?.setFilterValue(filterValue);

  open.value = false;
}
</script>

<template>
  <div class="p-2">
    <div class="flex flex-row gap-2">
      <Input class="max-w-sm" placeholder="Buscar..."
        :model-value="table.getColumn('title')?.getFilterValue() as string"
        @update:model-value="table.getColumn('title')?.setFilterValue($event)" />
      <Popover v-model:open="open">
        <PopoverTrigger as-child>
          <Button variant="outline" role="combobox" :aria-expanded="open" class="w-[200px] justify-between">
            {{ selectedBrand || 'Selecciona una marca...' }}
            <ChevronDown class="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-[200px] p-0">
          <Command>
            <CommandInput class="h-9" placeholder="Busca una marca..." />
            <CommandList>
              <CommandEmpty>No se encontraron marcas</CommandEmpty>
              <CommandGroup>
                <CommandItem v-for="brand in brands" :key="brand" :value="brand"
                  @select="(ev) => selectBrand(ev.detail.value as string)">
                  {{ brand }}
                  <CheckIcon :class="cn(
                    'ml-auto',
                    value === brand ? 'opacity-100' : 'opacity-0'
                  )
                    " />
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  </div>
  <Table class="border-0">
    <TableHeader>
      <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
        <TableHead v-for="header in headerGroup.headers" :key="header.id" class="p-4">
          <FlexRender v-if="!header.isPlaceholder" :render="header.column.columnDef.header"
            :props="header.getContext()" />
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <template v-if="table.getRowModel().rows?.length">
        <TableRow v-for="row in table.getRowModel().rows" :key="row.id"
          :data-state="row.getIsSelected() ? 'selected' : undefined">
          <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id" class="p-4">
            <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
          </TableCell>
        </TableRow>
      </template>
      <template v-else>
        <TableRow>
          <TableCell :colspan="columns.length" class="h-24 text-center">
            No results.
          </TableCell>
        </TableRow>
      </template>
    </TableBody>
  </Table>
  <div class="flex items-center justify-end space-x-2 px-2 py-4">
    <Button variant="outline" size="sm" :disabled="!table.getCanPreviousPage()" @click="table.previousPage()">
      Previous
    </Button>
    <Button variant="outline" size="sm" :disabled="!table.getCanNextPage()" @click="table.nextPage()">
      Next
    </Button>
  </div>
</template>
