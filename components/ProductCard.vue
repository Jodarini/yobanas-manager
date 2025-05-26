<script setup lang="ts">
  import type { Product } from '~/db/schema';

  defineProps<{ product: Product }>();
</script>

<template>
  <NuxtLink
    :to="`/product/${product.id}`"
    class="block transition-transform hover:scale-[1.02]"
  >
    <Card
      class="h-full w-full overflow-hidden border shadow-sm hover:shadow-md"
    >
      <CardContent class="flex flex-col p-0">
        <!-- Image container with proper aspect ratio -->
        <div class="relative w-full pb-[100%]">
          <!-- 1:1 aspect ratio -->
          <NuxtImg
            :src="product.thumbnail!"
            :alt="product.title"
            class="absolute inset-0 h-full w-full object-cover"
          />
        </div>

        <!-- Product details -->
        <div class="flex flex-grow flex-col p-4">
          <h3 class="mb-2 line-clamp-2 text-lg font-medium">
            {{ product.title }}
          </h3>

          <div class="mt-auto flex items-center justify-between">
            <span class="text-lg font-semibold">
              ${{
                parseInt(product.price).toLocaleString('es-CO', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })
              }}
            </span>
            <ClientOnly>
              <ProductDropdownMenu :id="product.id!" :title="product.title" />
            </ClientOnly>
          </div>
        </div>
      </CardContent>
    </Card>
  </NuxtLink>
</template>
