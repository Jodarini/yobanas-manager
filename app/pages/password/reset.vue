<script setup lang="ts">
const supabase = useSupabaseClient()
const email = ref('')
const errorRef = ref('')
const message = ref('')
const isLoading = ref(false)
const config = useRuntimeConfig()

const handleSubmit = async () => {
  isLoading.value = true
  message.value = ''
  errorRef.value = ''

  const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
    redirectTo: `${config.public.siteUrl}/password/update`,
  })

  isLoading.value = false

  if (error) {
    errorRef.value = error.message
    return
  }
  message.value = 'Correo enviado, revisa tu bandeja de entrada'
}

</script>

<template>
  <Card class="max-w-xl ">
    <CardHeader>
      <CardTitle>Reestablecer contraseña</CardTitle>
    </CardHeader>
    <CardContent>
      <Form class="flex w-full flex-col gap-2" @submit="handleSubmit">
        <Label for="email">Email</Label>
        <Input type="email" id="email" v-model="email" />
        <Button type="submit" :disabled="email.length === 0 || isLoading">Enviar</button>
        <p v-if="errorRef">{{ errorRef }}</p>
        <p v-if="message">{{ message }}</p>
      </form>
    </CardContent>
  </Card>
</template>
