<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogAction,
  } from '@/components/ui/alert-dialog';
  import { AlertTriangle } from 'lucide-vue-next';

  const isOpen = ref(true);

  // onMounted(() => {
  //   console.log('disclaimer mounted');
  //   // Check if user has already seen the disclaimer to avoid annoying them
  //   const hasSeenDisclaimer = localStorage.getItem('demo-disclaimer-seen');
  //
  //   if (!hasSeenDisclaimer) {
  //     // Small delay for better UX transition
  //     setTimeout(() => {
  //       isOpen.value = true;
  //     }, 500);
  //   }
  // });

  const handleAccept = () => {
    localStorage.setItem('demo-disclaimer-seen', 'true');
    isOpen.value = false;
  };
</script>

<template>
  <AlertDialog :open="isOpen">
    <AlertDialogContent class="max-w-md">
      <AlertDialogHeader>
        <div class="mb-2 flex items-center gap-3">
          <div class="rounded-full bg-amber-100 p-2">
            <AlertTriangle class="text-destructive-foreground h-6 w-6" />
          </div>
          <AlertDialogTitle class="text-foreground text-xl font-bold">
            Entorno de Demostración
          </AlertDialogTitle>
        </div>

        <AlertDialogDescription
          class="text-muted-foreground space-y-2 text-base leading-relaxed"
        >
          <p>
            Este sitio web opera exclusivamente con fines demostrativos y de
            prueba.
          </p>
          <p>
            Los datos, productos y transacciones mostrados son
            <strong>ficticios</strong>
            y no representan inventarios reales ni compromisos comerciales
            vinculantes.
          </p>
        </AlertDialogDescription>
      </AlertDialogHeader>

      <AlertDialogFooter class="mt-4">
        <AlertDialogAction
          class="bg-primary hover:bg-primary/70 w-full font-medium text-white transition-colors"
          @click="handleAccept"
        >
          Entendido, continuar al demo
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
