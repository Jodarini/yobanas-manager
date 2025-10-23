<script setup lang="ts">
  import { useAuth } from '~/composables/useAuth';
  import { Spinner } from '@/components/ui/spinner';

  const {
    signInAnonymous,
    signInWithPassword,
    userId,
    signOut,
    errorMessage,
    isLoading,
  } = useAuth();

  const email = ref('');
  const password = ref('');
</script>

<template>
  <Card class="max-w-xl">
    <CardHeader class="items-center">
      <CardTitle>Iniciar sesión</CardTitle>
      <CardDescription>
        Por favor, inicia sesión para continuar.
      </CardDescription>
    </CardHeader>
    <CardContent class="flex flex-col items-center justify-center gap-4">
      <form
        class="flex w-full flex-col gap-2"
        @submit.prevent="signInWithPassword(email, password)"
      >
        <Input v-model="email" placeholder="Email" />
        <Input v-model="password" type="password" placeholder="Contraseña" />
        <Button
          v-if="!userId"
          :disabled="email.length === 0 || isLoading || password.length === 0"
          class="w-full"
          type="submit"
        >
          <span v-if="isLoading" class="flex items-center">
            <Spinner class="mr-2" />
            Iniciando sesión...
          </span>
          <span v-else>Iniciar sesión</span>
        </Button>
      </form>

      <Button
        v-if="!userId"
        variant="ghost"
        class="w-full"
        :disabled="isLoading"
        @click="signInAnonymous"
      >
        Ingresa como invitado
      </Button>
      <Button v-else class="w-full" :disabled="isLoading" @click="signOut">
        <span v-if="isLoading" class="mr-2">
          <Spinner />
          Cerrando sesión...
        </span>
        <span v-else>Cerrar sesión</span>
      </Button>
      <p
        v-if="errorMessage"
        class="text-destructive dark:text-destructive-foreground"
      >
        {{ errorMessage }}
      </p>
    </CardContent>
  </Card>
</template>
