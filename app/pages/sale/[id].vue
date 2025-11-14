<script setup lang="ts">
  const route = useRoute();
  const { data, error } = await useFetch(`/api/sale/${route.params.id}`);
</script>

<template>
  <div>
    <!-- <h1>Venta #{{ data.id }}</h1> -->
    <div v-if="error">
      <p>Error: {{ error }}</p>
      <pre>{{ JSON.stringify(error, null, 2) }}</pre>
    </div>
    <div else-if="data" class="mb-2 flex flex-col gap-2 md:flex-row">
      <Card class="flex-2">
        <CardHeader>
          <CardTitle>Productos vendidos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>Productos vendidos</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead class="w-[100px]">Producto</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Precio unidad</TableHead>
                <TableHead class="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="sale in data" :key="sale.products?.id">
                <TableCell class="font-medium">
                  {{ sale.products?.title }}
                </TableCell>
                <TableCell>{{ sale.sale_items?.quantity }}</TableCell>
                <TableCell>{{ sale.sale_items?.unit_price }}</TableCell>
                <TableCell class="text-right">
                  {{ sale.sale_items.quantity * sale.sale_items.unit_price }}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card class="flex-1">
        <CardHeader>
          <CardTitle>Detalles</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="flex flex-col gap-4">
            <div>
              <label class="text-muted-foreground">Fecha</label>
              <p class="">
                {{ data[0]?.sales.created_at }}
              </p>
            </div>
            <Separator />
            <div>
              <label class="text-muted-foreground">Estado</label>
              <p class="">
                {{ data[0].sales.status }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
