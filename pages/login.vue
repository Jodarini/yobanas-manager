<script setup lang="ts">
  import { useAuth } from '~/composables/useAuth';

  const supabase = useSupabaseClient();
  const { signInAnonymous, signInWithPassword, userId, signOut, errorMessage } =
    useAuth();

  const email = ref('');
  const password = ref('');

  // const signUp = async () => {
  //   const { data, error } = await supabase.auth.signUp({
  //     email: email.value,
  //     password: password.value,
  //   });
  //   console.log('Full data object:', data);
  //   console.log('User:', data.user);
  //   console.log('Session:', data.session);

  //   if (error) {
  //     console.error('Signup error:', error);
  //   }
  // };
</script>

<template>
  <Card class="max-w-xl">
    <CardHeader class="items-center">
      <CardTitle>Login</CardTitle>
      <CardDescription>Please sign in to continue.</CardDescription>
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
      <Button v-else class="w-full" @click="signOut">Sign Out</Button>
      <p v-if="errorMessage" style="color: red">{{ errorMessage }}</p>
    </CardContent>
  </Card>
</template>
