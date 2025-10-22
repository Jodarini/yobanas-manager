<script setup lang="ts">
  import { useAuth } from '~/composables/useAuth';

  const { signInAnonymous, signInWithPassword, userId, signOut, errorMessage } =
    useAuth();

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
      <!-- <form class="flex w-full flex-col gap-2" @submit.prevent="signUp">
        <Input v-model="email" placeholder="Email" />
        <Input v-model="password" type="password" placeholder="Contraseña" />
        <Button
          v-if="!userId"
          :disabled="email.length === 0"
          class="w-full"
          @click="signUp"
        >
          Sign Up with Email
        </Button>
      </form> -->

      <form
        class="flex w-full flex-col gap-2"
        @submit.prevent="signInWithPassword(email, password)"
      >
        <Input v-model="email" placeholder="Email" />
        <Input v-model="password" type="password" placeholder="Contraseña" />
        <Button
          v-if="!userId"
          :disabled="email.length === 0"
          class="w-full"
          type="submit"
        >
          Sign In with Email
        </Button>
      </form>

      <Button
        v-if="!userId"
        variant="ghost"
        class="w-full"
        @click="signInAnonymous"
      >
        Sign In Anonymously
      </Button>
      <Button v-else class="w-full" @click="signOut">Cerrar sesión</Button>
      <p
        v-if="errorMessage"
        class="text-destructive dark:text-destructive-foreground"
      >
        {{ errorMessage }}
      </p>
    </CardContent>
  </Card>
</template>
