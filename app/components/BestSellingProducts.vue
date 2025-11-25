<script setup lang="ts">
  import { formatCurrency } from '~/lib/utils';
  import type { Product, ProductVariant, Sale, Sale_Item } from '~~/db/schema';

  const props = defineProps<{
    data: {
      sales: Sale[];
      sale_items: {
        sale_items: Sale_Item;
        product_variants: ProductVariant | null;
        products: Product | null;
      }[];
    };
  }>();

  const newArray = props.data.sale_items.toSorted(
    (a, b) => b.sale_items.quantity - a.sale_items.quantity
  );
  console.log(props);
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Más vendidos</CardTitle>
    </CardHeader>
    <CardContent>
      <div
        v-for="(item, index) in newArray.slice(0, 5)"
        :key="index"
        class="flex flex-row justify-between"
      >
        <div class="flex flex-col">
          <div class="font-bold">{{ item.products?.title }}</div>
          <div class="text-muted-foreground">
            {{ item.sale_items.quantity }} unidades vendidas
          </div>
        </div>
        <div class="font-extrabold">
          {{
            formatCurrency(
              item.sale_items.quantity * Number(item.sale_items.unit_price)
            )
          }}
        </div>
      </div>
    </CardContent>
  </Card>
</template>
