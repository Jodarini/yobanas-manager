<script setup lang="ts">
const supabase = useSupabaseClient()
const email = ref('')
const errorRef = ref('')

const handleSubmit = async () => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email.value, {
    redirectTo: 'http://localhost:3000/password/update',
  })

  if (error) {
    errorRef.value = error.message
    return
  }
  errorRef.value = 'Revisa tu email'

  console.log(data)
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
