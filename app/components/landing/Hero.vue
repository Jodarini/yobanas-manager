<script setup lang="ts">
  import { Button } from '@/components/ui/button';
  import { ArrowRight } from 'lucide-vue-next';

  const navigateToSignup = () => navigateTo('/register');
</script>

<template>
  <section class="relative overflow-hidden pt-20 pb-32 md:pt-32 md:pb-48">
    <!-- Background decorative elements -->
    <div
      class="bg-primary/5 absolute top-0 left-1/2 -z-10 h-[500px] w-[1000px] -translate-x-1/2 rounded-full blur-3xl"
    />

    <div class="container mx-auto px-4 text-center md:px-6">
      <!-- <Badge -->
      <!--   variant="secondary" -->
      <!--   class="animate-fade-in mb-6 rounded-full px-4 py-1.5 text-sm" -->
      <!-- > -->
      <!--   🚀 Nueva versión 2.0 disponible -->
      <!-- </Badge> -->

      <h1
        class="from-foreground to-foreground/70 mb-6 bg-gradient-to-r bg-clip-text text-4xl font-extrabold tracking-tight text-transparent md:text-6xl lg:text-7xl"
      >
        Control total de tu
        <br class="hidden md:block" />
        <span class="text-primary">inventario</span>
      </h1>

      <p
        class="text-muted-foreground mx-auto mb-10 max-w-[800px] text-xl leading-relaxed"
      >
        La plataforma todo-en-uno para tiendas de ropa en Colombia. Gestiona
        tallas, colores, y ventas sin hojas de cálculo complicadas.
      </p>

      <div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Button
          size="lg"
          class="shadow-primary/20 h-12 gap-2 px-8 text-lg shadow-lg"
          @click="navigateToSignup"
        >
          Comenzar prueba gratis
          <ArrowRight class="h-4 w-4" />
        </Button>
        <!-- <Button variant="outline" size="lg" class="h-12 px-8 text-lg"> -->
        <!--   Ver demo en vivo -->
        <!-- </Button> -->
      </div>

      <!-- Dashboard Preview with 3D tilt effect suggestion -->
      <!-- <div class="relative mx-auto mt-20 max-w-5xl"> -->
      <!--   <div -->
      <!--     class="bg-background/50 rounded-xl border p-2 shadow-2xl ring-1 ring-white/10 backdrop-blur-sm lg:rounded-2xl" -->
      <!--   > -->
      <!--     <img -->
      <!--       src="/dashboard-preview.png" -->
      <!--       alt="Dashboard Preview" -->
      <!--       class="h-auto w-full rounded-lg border shadow-inner" -->
      <!--     /> -->
      <!--   </div> -->
      <!--   <!-- Floating stats card decoration -->
      <!--   <div class="absolute -top-12 -right-12 hidden lg:block"> -->
      <!--     <Card class="animate-bounce-slow w-64 p-4 shadow-xl"> -->
      <!--       <div class="flex items-center gap-4"> -->
      <!--         <div -->
      <!--           class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100" -->
      <!--         > -->
      <!--           <TrendingUp class="h-6 w-6 text-green-600" /> -->
      <!--         </div> -->
      <!--         <div> -->
      <!--           <p class="text-muted-foreground text-sm font-medium"> -->
      <!--             Ventas hoy -->
      <!--           </p> -->
      <!--           <p class="text-foreground text-2xl font-bold">$1.2M</p> -->
      <!--         </div> -->
      <!--       </div> -->
      <!--     </Card> -->
      <!--   </div> -->
      <!-- </div> -->
    </div>
  </section>
</template>
