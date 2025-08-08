<script setup>
import MasterLayout from "./MasterLayout.vue";
import Footer from './Footer.vue';

const loggedIn=false
</script>

<template>
  <MasterLayout :loggedIn="loggedIn">
    <template #footer  v-if="!loggedIn">
      <Footer></Footer> 
    </template>
  </MasterLayout>
</template>

<style scoped>

</style>