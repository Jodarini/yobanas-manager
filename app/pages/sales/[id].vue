<script setup lang="ts">
  import { formatCurrency } from '~/lib/utils';
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
                  <div class="text-muted-foreground flex flex-row">
                    {{ sale.product_variants?.size }} •
                    {{ sale.product_variants?.color }}
                  </div>
                </TableCell>
                <TableCell>{{ sale.sale_items?.quantity }}</TableCell>
                <TableCell>
                  {{ formatCurrency(sale.sale_items?.unit_price) }}
                </TableCell>
                <TableCell class="text-right">
                  {{
                    formatCurrency(
                      sale.sale_items?.quantity * sale.sale_items?.unit_price
                    )
                  }}
                </TableCell>
                <TableCell class="text-right">
                  <Button as-child variant="outline">
                    <NuxtLink as-child :to="`/products/${sale.products?.id}`">
                      Ver
                    </NuxtLink>
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow class="bg-muted/10">
                <TableCell colspan="5" class="text-left md:text-right">
                  Total general:
                  {{ formatCurrency(data[0]?.sales.total_amount) }}
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
