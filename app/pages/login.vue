<script setup lang="ts">
definePageMeta({
  middleware: 'guest'
});
import { useAuth } from '~/composables/useAuth';

const {
  signInAnonymous,
  signInWithPassword,
  user,
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
      <Form class="flex w-full flex-col gap-2" @submit="signInWithPassword(email, password)">
        <Input v-model="email" placeholder="Email" />
        <Input v-model="password" type="password" placeholder="Contraseña" />
        <Button v-if="!user" :disabled="email.length === 0 || isLoading || password.length === 0" class="w-full"
          type="submit">
          <span v-if="isLoading" class="flex items-center">
            <Spinner class="mr-2" />
            Iniciando sesión...
          </span>
          <span v-else>Iniciar sesión</span>
        </Button>
      </Form>

      <div v-if="!user" class="flex flex-col items-center justify-center">
        <Button v-if="!user" variant="link" class="w-full text-muted-foreground text-xs hover:cursor-pointer"
          :disabled="isLoading" @click="signInAnonymous">
          Ingresa como invitado
        </Button>

        <Button as-child v-if="!user" variant="link" class="w-full text-muted-foreground text-xs hover:cursor-pointer">
          <NuxtLink to="/password/reset">¿Olvidaste tu contraseña?</NuxtLink>
        </Button>
      </div>

      <Button v-else class="w-full" :disabled="isLoading" @click="signOut">
        <span v-if="isLoading" class="mr-2">
          <Spinner />
          Cerrando sesión...
        </span>
        <span v-else>Cerrar sesión</span>
      </Button>
      <p v-if="errorMessage" class="text-xs text-destructive-foreground dark:text-destructive-foreground">
        {{ errorMessage }}
      </p>
    </CardContent>
  </Card>
</template>
