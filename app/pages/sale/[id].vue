<script setup lang="ts">

const route = useRoute();
const data = await useFetch(`/api/sale/${route.params.id}`)

</script>


<template>
  <h1>THE SALE</h1>
  {{ data }}
</template>
