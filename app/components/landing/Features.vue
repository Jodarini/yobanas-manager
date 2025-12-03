<script setup lang="ts">
  import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
  } from '@/components/ui/card';
  import {
    Shirt,
    BarChart3,
    ScanBarcode,
    Zap,
    ShieldCheck,
    RefreshCw,
  } from 'lucide-vue-next';

  const features = [
    {
      title: 'Gestión de Variantes',
      desc: 'Control granular de tallas y colores. Nunca más vendas algo que no tienes.',
      icon: Shirt,
    },
    {
      title: 'Reportes Inteligentes',
      desc: 'Identifica tus "Best Sellers" y productos estancados con un clic.',
      icon: BarChart3,
    },
    {
      title: 'SKU Automático',
      desc: 'Generación automática de códigos únicos para cada variante de producto.',
      icon: ScanBarcode,
    },
    {
      title: 'Actualización Real',
      desc: 'Sincronización instantánea de inventario en todos tus dispositivos.',
      icon: RefreshCw,
    },
    {
      title: 'Seguridad Total',
      desc: 'Tus datos encriptados y respaldados diariamente en la nube.',
      icon: ShieldCheck,
    },
    {
      title: 'Venta Rápida',
      desc: 'Interfaz optimizada para registrar ventas en segundos frente al cliente.',
      icon: Zap,
    },
  ];
</script>

<template>
  <section id="features" class="bg-card py-24">
    <div class="container mx-auto px-4 md:px-6">
      <div class="mx-auto mb-16 max-w-3xl text-center">
        <h2 class="mb-4 text-3xl font-bold md:text-4xl">
          Todo lo que tu tienda necesita
        </h2>
        <p class="text-muted-foreground text-lg">
          Deja las libretas y Excel. Pásate a una gestión profesional diseñada
          para retail.
        </p>
      </div>

      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card
          v-for="feature in features"
          :key="feature.title"
          class="bg-background/60 supports-backdrop-filter:bg-background/60 border-none shadow-sm backdrop-blur transition-all duration-300 hover:shadow-md"
        >
          <CardHeader>
            <div
              class="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg"
            >
              <component :is="feature.icon" class="text-primary h-6 w-6" />
            </div>
            <CardTitle class="text-xl">{{ feature.title }}</CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-muted-foreground leading-relaxed">
              {{ feature.desc }}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
</template>
