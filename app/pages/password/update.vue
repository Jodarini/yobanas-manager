<script setup lang="ts">
const supabase = useSupabaseClient()

const newPassword = ref('')
const errorRef = ref('')

const handleSubmit = async () => {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword.value }
  )
  if (error) {
    errorRef.value = error.message
    return
  }

  navigateTo('/')


}


</script>

<template>
  <div>
    <h1>Actualiza tu contraseña</h1>
    <form @submit.prevent="handleSubmit">
      <label for="newPassword">New password</label>
      <input type="password" id="newPassword" v-model="newPassword" />
      <span v-if="errorRef">{{ errorRef }}</span>
      <button type="submit">Submit</button>
    </form>


  </div>
</template>
