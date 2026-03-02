<script setup> 
  import { useRoute} from 'vue-router'
  import MasterLayout from "./MasterLayout.vue"
  import PrintLayout from "./PrintLayout.vue"
  import Footer from './footer/Footer.vue' 

  const route=useRoute()
  
</script>

<template>
  <MasterLayout v-if="!route.name.includes('catalogue_print')">
    <template #footer>
      <Footer></Footer> 
    </template>
  </MasterLayout>
  <PrintLayout v-if="route.name.includes('catalogue_print')">    
  </PrintLayout>
</template>

<style scoped>

</style>