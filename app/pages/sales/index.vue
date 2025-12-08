<script setup lang="ts">
const filter = ref('mes');
const salesCache = useState<Map<string, any>>('sales-cache', () => new Map());

const { data: salesData } = await useFetch('/api/sales', {
  key: computed(() => `sales-${filter.value}`),
  query: { filter },
  getCachedData(key) {
    return salesCache.value.get(filter.value);
  },
  onResponse({ response }) {
    if (response._data) {
      salesCache.value.set(filter.value, response._data);
    }
  },
});

const numSales = computed(() => salesData.value?.sales.length);
const totalRevenue = computed(() =>
  salesData.value?.sales.reduce((acc, s) => acc + Number(s.total_amount), 0)
);
</script>

<template>
  <div>
    <div class="mb-6">
      <div class="flex w-full flex-row items-center justify-between">
        <div>
          <h1 class="text-2xl">Resumen de ventas</h1>
          <p class="text-muted-foreground">
            Supervisa, gestiona y pronostica tus ventas.
          </p>
        </div>
        <Select v-model="filter" :default-value="filter" class="w-full">
          <SelectTrigger>
            <SelectValue placeholder="Filtra por fechas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dia">Últimas 24 horas</SelectItem>
            <SelectItem value="semana">Esta semana</SelectItem>
            <SelectItem value="mes">Últimos 30 días</SelectItem>
            <SelectItem value="trimestre">Trimestre</SelectItem>
            <SelectItem value="año">Año</SelectItem>
            <SelectItem value="todo">Historial completo</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
    <div class="flex w-full flex-wrap gap-4">
      <template v-if="!numSales">
        <span class="text-muted-foreground">
          Para este periodo no se registran ventas.
        </span>
      </template>
      <template v-else>
        <Card class="flex w-sm flex-row items-center justify-between">
          <div class="w-full">
            <CardHeader>
              <CardTitle class="font-medium">Total ordenes</CardTitle>
            </CardHeader>
            <CardContent class="text-2xl font-extrabold">
              {{ numSales }}
            </CardContent>
          </div>
          <CardFooter class="h-fit">
            <ReceiptText />
          </CardFooter>
        </Card>

        <Card class="flex w-sm flex-row items-center justify-between">
          <div class="w-full">
            <CardHeader>
              <CardTitle class="font-medium">Total ganancias</CardTitle>
            </CardHeader>
            <CardContent class="text-2xl font-extrabold">
              {{ totalRevenue?.toLocaleString('es-CO') }}
            </CardContent>
          </div>
          <CardFooter class="h-fit">
            <DollarSign />
            <!-- <Tags /> -->
          </CardFooter>
        </Card>
      </template>
    </div>
    <template v-if="salesData && numSales">
      <BestSellingProducts :data="salesData" class="my-2" />
      <SalesTable :data="salesData.sales" />
    </template>
  </div>
</template>
