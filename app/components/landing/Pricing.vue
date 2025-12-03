<script setup lang="ts">
  import { Button } from '@/components/ui/button';
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
  } from '@/components/ui/card';
  import { Badge } from '@/components/ui/badge';
  import { Check } from 'lucide-vue-next';

  const plans = [
    {
      name: 'Gratis',
      price: '$0',
      desc: 'Para empezar tu emprendimiento',
      features: ['Hasta 10 productos', '1 Usuario', 'Soporte básico'],
      cta: 'Comenzar Gratis',
      variant: 'outline',
      popular: false,
    },
    {
      name: 'Emprendedor',
      price: '$25.000',
      desc: 'Para tiendas en crecimiento',
      features: [
        'Hasta 500 productos',
        'Reportes avanzados',
        'Soporte prioritario',
        'Exportación a Excel',
      ],
      cta: 'Elegir Emprendedor',
      variant: 'default',
      popular: true,
    },
    {
      name: 'Negocio',
      price: '$50.000',
      desc: 'Para operaciones grandes',
      features: [
        'Hasta 1000 productos',
        'Múltiples usuarios',
        'API Access',
        'Soporte dedicado 24/7',
      ],
      cta: 'Elegir Negocio',
      variant: 'outline',
      popular: false,
    },
  ];
</script>

<template>
  <section id="pricing" class="py-24">
    <div class="container mx-auto px-4 md:px-6">
      <div class="mb-16 text-center">
        <h2 class="mb-4 text-3xl font-bold md:text-4xl">
          Precios transparentes
        </h2>
        <p class="text-muted-foreground text-lg">
          Sin costos ocultos. Cancela cuando quieras.
        </p>
      </div>

      <div
        class="mx-auto grid max-w-6xl grid-cols-1 items-start gap-8 md:grid-cols-3"
      >
        <Card
          v-for="plan in plans"
          :key="plan.name"
          :class="[
            'relative flex flex-col',
            plan.popular
              ? 'border-primary z-10 scale-105 shadow-lg'
              : 'border-border',
          ]"
        >
          <div
            v-if="plan.popular"
            class="absolute -top-3 left-1/2 -translate-x-1/2"
          >
            <Badge class="px-3 py-1">Más Popular</Badge>
          </div>

          <CardHeader class="pt-10 pb-8 text-center">
            <CardTitle class="text-2xl">{{ plan.name }}</CardTitle>
            <CardDescription>{{ plan.desc }}</CardDescription>
            <div class="mt-4">
              <span class="text-4xl font-bold">{{ plan.price }}</span>
              <span class="text-muted-foreground">/mes</span>
            </div>
          </CardHeader>

          <CardContent class="flex-1">
            <ul class="space-y-3">
              <li
                v-for="feat in plan.features"
                :key="feat"
                class="flex items-center gap-2"
              >
                <div
                  class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100"
                >
                  <Check class="h-3 w-3 text-green-600" />
                </div>
                <span class="text-muted-foreground text-sm">{{ feat }}</span>
              </li>
            </ul>
          </CardContent>

          <CardFooter class="pt-8">
            <Button :variant="plan.variant" class="h-11 w-full" as-child>
              <NuxtLink to="/sign-up">{{ plan.cta }}</NuxtLink>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  </section>
</template>
