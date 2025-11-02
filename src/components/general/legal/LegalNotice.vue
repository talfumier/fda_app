<script setup>
  import { ref,watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import text from './text.json'

  const {locale}=useI18n()

  const data=ref(null)
  watch(   
    () => locale.value,              // <-- getter function required for primitive value
    (v) => { data.value=text[v]},
    { immediate: false }
  )

</script>

<template>
  <h1> LEGAL NOTICE PAGE</h1>
</template>

<style scoped>

</style>