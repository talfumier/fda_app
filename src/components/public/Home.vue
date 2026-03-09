<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetch } from './functions'

const state = ref([])
const details = computed(() => state.value?.[0]?.[0] ?? null)

onMounted(async () => {
  try {
    const data = await fetch('public_home_details')
    state.value = Array.isArray(data) ? data : []
    console.log('DATA', data)
  } catch (error) {
    console.error('onMounted failed', error)
    state.value = []
  }
})
</script>

<template>
  <div>state length: {{ state?.length ?? 0 }}</div>
  <div v-if="details">loaded: {{ details.building }}</div>
  <div v-else>no details</div>
</template>