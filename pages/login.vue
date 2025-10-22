<script setup lang="ts">
  import { useAuth } from '~/composables/useAuth';

  // const supabase = useSupabaseClient();
  const { signInAnonymous, userId, signOut, errorMessage } = useAuth();

  const email = ref('');
  const password = ref('');

  // const signUp = async () => {
  //   const { data, error } = await supabase.auth.signUp({
  //     email: email.value,
  //     password: password.value,
  //   });

  //   if (error) {
  //     console.error(error);
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
      <!-- <form class="flex w-full flex-col gap-2" @submit="signUp">
        <Input v-model="email" placeholder="Email" />
        <Input v-model="password" type="password" placeholder="Contraseña" />
        <Button
          v-if="!userId"
          :disabled="email.length === 0"
          class="w-full"
          @click="signUp"
        >
          Sign In with Email
        </Button>
      </form> -->

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
