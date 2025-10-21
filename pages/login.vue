<script setup lang="ts">
  import { useAuth } from '~/composables/useAuth';

  const { signInAnonymous, userId, signOut, errorMessage } = useAuth();
</script>

<template>
  <Card class="max-w-xl">
    <CardHeader class="items-center">
      <CardTitle>Login</CardTitle>
      <CardDescription>Please sign in to continue.</CardDescription>
    </CardHeader>
    <CardContent class="flex flex-col items-center justify-center gap-4">
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
