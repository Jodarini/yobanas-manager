<script setup lang="ts">
  import { Package, DollarSign, ReceiptText } from 'lucide-vue-next';

  const { data: salesData } = await useFetch('/api/sales', {
    key: 'sales',
  });

  const numSales = computed(() => salesData.value?.sales.length);
  const totalRevenue = computed(() =>
    salesData.value?.sales.reduce((acc, s) => acc + Number(s.total_amount), 0)
  );
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl">Resumen de ventas</h1>
      <p class="text-muted-foreground">
        Supervisa, gestiona y pronostica tus ventas.
      </p>
    </div>
    <div class="flex w-full flex-wrap gap-4">
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

      <!-- <Card class="flex w-sm flex-row items-center justify-between"> -->
      <!--   <div class="w-full"> -->
      <!--     <CardContent class="text-2xl font-bold"> -->
      <!--       {{ dashboardData?.stock }} -->
      <!--     </CardContent> -->
      <!--     <CardHeader> -->
      <!--       <CardTitle class="font-medium">Productos en inventario</CardTitle> -->
      <!--     </CardHeader> -->
      <!--   </div> -->
      <!--   <CardFooter class="h-fit"> -->
      <!--     <Warehouse /> -->
      <!--   </CardFooter> -->
      <!-- </Card> -->
      <!-- <Card class="flex w-sm flex-row items-center justify-between"> -->
      <!--   <div class="w-full"> -->
      <!--     <CardContent class="text-2xl font-bold"> -->
      <!--       {{ -->
      <!--         dashboardData?.value?.toLocaleString('es-CO', { -->
      <!--           style: 'currency', -->
      <!--           currency: 'COP', -->
      <!--           minimumFractionDigits: 0, -->
      <!--         }) -->
      <!--       }} -->
      <!--     </CardContent> -->
      <!--     <CardHeader> -->
      <!--       <CardTitle class="font-medium">Valor total</CardTitle> -->
      <!--     </CardHeader> -->
      <!--   </div> -->
      <!--   <CardFooter class="h-fit"> -->
      <!--     <DollarSign /> -->
      <!--   </CardFooter> -->
      <!-- </Card> -->
    </div>
    <SalesTable :data="salesData.sales" />
  </div>
</template>
