<script setup> 
  import { computed } from 'vue'
  import { useRoute} from 'vue-router'
  import MasterLayout from "./MasterLayout.vue"
  import PrintLayout from "./PrintLayout.vue"
  import Footer from './footer/Footer.vue' 

  const route=useRoute()
  const isPrint = computed(() =>
    String(route.name ?? '').includes('catalogue_print')
  )
</script>

<template>
  <PrintLayout v-if="isPrint" />
  <MasterLayout v-else :route="route">
    <template #footer>
      <Footer></Footer>
    </template>
  </MasterLayout>
</template>

<style scoped>

</style>