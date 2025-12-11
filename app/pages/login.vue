<script setup lang="ts">
  import { useAuth } from '~/composables/useAuth';
  import { z } from 'zod';
  import { toTypedSchema } from '@vee-validate/zod';
  import { useForm } from 'vee-validate';

  definePageMeta({
    middleware: 'guest',
  });

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

  const auth = useAuth();

  // Validation schema with Zod
  const signUpSchema = toTypedSchema(
    z
      .object({
        email: z
          .string({ error: 'Ingresa tu correo electrónico' })
          .email({
            message:
              'Verifica que tu correo sea válido (ejemplo: tu@correo.com)',
          })
          .min(1, 'Ingresa tu correo electrónico'),
        password: z
          .string({ error: 'Crea una contraseña para tu cuenta' })
          .min(8, 'La contraseña debe tener al menos 8 caracteres')
          .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
          .regex(/[a-z]/, 'Debe contener al menos una minúscula')
          .regex(/[0-9]/, 'Debe contener al menos un número'),
        confirmPassword: z.string({ error: 'Confirma tu contraseña' }),
      })
      .refine((data) => data.password === data.confirmPassword, {
        message: 'Las contraseñas no coinciden',
        path: ['confirmPassword'],
      })
  );

  const form = useForm({
    validationSchema: signUpSchema,
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await auth.signUp(values.email, values.password);
  });

  const isFormDisabled = computed(() => {
    return !form.meta.value.valid || auth.isLoading.value;
  });
</script>

<template>
  <Tabs default-value="log">
    <TabsList>
      <TabsTrigger value="log">Log In</TabsTrigger>
      <TabsTrigger value="sign">Sign Up</TabsTrigger>
    </TabsList>
    <TabsContent value="log">
      <Card class="max-w-xl">
        <CardHeader class="items-center">
          <CardTitle>Iniciar sesión</CardTitle>
          <CardDescription>
            Por favor, inicia sesión para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent class="flex flex-col items-center justify-center gap-4">
          <Form
            class="flex w-full flex-col gap-2"
            @submit="signInWithPassword(email, password)"
          >
            <Input v-model="email" placeholder="Email" />
            <Input
              v-model="password"
              type="password"
              placeholder="Contraseña"
            />
            <Button
              v-if="!user"
              :disabled="
                email.length === 0 || isLoading || password.length === 0
              "
              class="w-full"
              type="submit"
            >
              <span v-if="isLoading" class="flex items-center">
                <Spinner class="mr-2" />
                Iniciando sesión...
              </span>
              <span v-else>Iniciar sesión</span>
            </Button>
          </Form>

          <div v-if="!user" class="flex flex-col items-center justify-center">
            <Button
              v-if="!user"
              variant="link"
              class="text-muted-foreground w-full text-xs hover:cursor-pointer"
              :disabled="isLoading"
              @click="signInAnonymous"
            >
              Ingresa como invitado
            </Button>

            <Button
              v-if="!user"
              as-child
              variant="link"
              class="text-muted-foreground w-full text-xs hover:cursor-pointer"
            >
              <NuxtLink to="/password/reset">
                ¿Olvidaste tu contraseña?
              </NuxtLink>
            </Button>
          </div>

          <Button v-else class="w-full" :disabled="isLoading" @click="signOut">
            <span v-if="isLoading" class="mr-2">
              <Spinner />
              Cerrando sesión...
            </span>
            <span v-else>Cerrar sesión</span>
          </Button>
          <p
            v-if="errorMessage"
            class="text-destructive-foreground dark:text-destructive-foreground text-xs"
          >
            {{ errorMessage }}
          </p>
        </CardContent>
      </Card>
    </TabsContent>
    <TabsContent value="sign">
      <Card class="max-w-xl">
        <CardHeader class="items-center">
          <CardTitle>Crear cuenta</CardTitle>
          <CardDescription>
            Por favor, crea una cuenta para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent class="flex flex-col items-center justify-center gap-4">
          <form class="flex w-full flex-col gap-4" @submit="onSubmit">
            <FormField v-slot="{ componentField }" name="email">
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="tu@email.com"
                    autocomplete="email"
                    v-bind="componentField"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="password">
              <FormItem>
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autocomplete="new-password"
                    v-bind="componentField"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="confirmPassword">
              <FormItem>
                <FormLabel>Confirmar contraseña</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autocomplete="new-password"
                    v-bind="componentField"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <Button :disabled="isFormDisabled" class="w-full" type="submit">
              <span v-if="auth.isLoading.value" class="flex items-center">
                <Spinner class="mr-2" />
                Creando cuenta...
              </span>
              <span v-else>Crear cuenta</span>
            </Button>
          </form>

          <p v-if="auth.errorMessage" class="text-destructive text-xs">
            {{ auth.errorMessage }}
          </p>

          <div class="relative flex w-full items-center gap-2">
            <Separator class="flex-1" />
            <span class="text-muted-foreground text-xs">O continúa con</span>
            <Separator class="flex-1" />
          </div>

          <Button
            variant="link"
            class="text-muted-foreground w-full cursor-pointer"
            :disabled="auth.isLoading.value"
            @click="auth.signInAnonymous"
          >
            Ingresa como invitado
          </Button>
        </CardContent>
      </Card>
    </TabsContent>
  </Tabs>
</template>
