<script setup lang="ts">
const supabase = useSupabaseClient()

const newPassword = ref('')
const errorRef = ref('')
const isLoading = ref(false)

const handleSubmit = async () => {
  isLoading.value = true
  const { error } = await supabase.auth.updateUser({ password: newPassword.value }
  )
  isLoading.value = false
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
