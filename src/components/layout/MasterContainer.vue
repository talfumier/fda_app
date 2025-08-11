<script setup>
  import MasterLayout from "./MasterLayout.vue";
  import Footer from './footer/Footer.vue';

  const loggedIn=false
</script>

<template>
  <MasterLayout :loggedIn="loggedIn">
    <template #footer>
      <Footer></Footer> 
    </template>
  </MasterLayout>
</template>

<style scoped>

</style>