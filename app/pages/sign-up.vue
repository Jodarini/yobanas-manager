<script setup lang="ts">
  const auth = useAuth();
  const email = ref('');
  const password = ref('');
</script>
<template>
  <Card class="max-w-xl">
    <CardHeader class="items-center">
      <CardTitle>Crear cuenta</CardTitle>
      <CardDescription>
        Por favor, crea una cuenta para continuar.
      </CardDescription>
    </CardHeader>
    <CardContent class="flex flex-col items-center justify-center gap-4">
      <Form
        class="flex w-full flex-col gap-2"
        @submit="auth.signUp(email, password)"
      >
        <Input v-model="email" placeholder="Email" />
        <Input v-model="password" type="password" placeholder="Contraseña" />
        <Button
          :disabled="
            email.length === 0 || auth.isLoading.value || password.length === 0
          "
          class="w-full"
          type="submit"
        >
          <span v-if="auth.isLoading.value" class="flex items-center">
            <Spinner class="mr-2" />
            Iniciando sesión...
          </span>
          <span v-else>Iniciar sesión</span>
        </Button>
      </Form>

      <p
        v-if="auth.errorMessage"
        class="text-destructive-foreground dark:text-destructive-foreground text-xs"
      >
        {{ auth.errorMessage }}
      </p>
    </CardContent>
  </Card>
</template>
