<script setup lang="ts">
const supabase = useSupabaseClient()
const email = ref('')
const errorRef = ref('')
const config = useRuntimeConfig()

const handleSubmit = async () => {
  const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
    redirectTo: `${config.public.siteUrl}/password/update`,
  })

  if (error) {
    errorRef.value = error.message
    return
  }
  errorRef.value = 'Revisa tu email'

}

</script>

<template>
  <div>
    <h1>Reset your password</h1>
    <form @submit.prevent="handleSubmit">
      <label for="email">Email</label>
      <input type="email" id="email" v-model="email" />
      <button type="submit">Submit</button>
      <p v-if="errorRef">{{ errorRef }}</p>
    </form>
  </div>
</template>
