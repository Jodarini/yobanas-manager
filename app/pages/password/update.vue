<script setup lang="ts">
const supabase = useSupabaseClient()


const newPassword = ref('')
const errorRef = ref('')
const isLoading = ref(false)
const isRecoveryMode = ref(false)
const route = useRoute()

onMounted(async () => {
  const code = route.query.code as string
  const type = route.query.type as string

  if (code && type === 'recovery') {
    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Error exchanging code:', error)
      // Handle error - maybe redirect to error page
    } else {
      // User is now authenticated and can update their password
      // Show your password reset form
    }
  }
})

const handleSubmit = async () => {

  if (!isRecoveryMode.value) {
    errorRef.value = 'Acceso no autorizado'
    return
  }
  isLoading.value = true

  const { error } = await supabase.auth.updateUser({ password: newPassword.value })

  if (error) {
    errorRef.value = error.message
    return
  }
  navigateTo('/')
}


</script>

<template>
  <Card class="max-w-xl ">
    <CardHeader>
      <CardTitle>Actualiza tu contraseña</CardTitle>
    </CardHeader>
    <CardContent>
      <Form class="flex w-full flex-col gap-2" @submit="handleSubmit">
        <Label for="newPassword">contraseña</Label>
        <Input type="password" id="newPassword" v-model="newPassword" />
        <Button type="submit" :disabled="newPassword.length === 0 || isLoading">Enviar</button>
        <p v-if="errorRef">{{ errorRef }}</p>
      </form>
    </CardContent>
  </Card>
</template>
