<script setup>
  import { provide } from 'vue';
  import { useCookieRef } from './composable/useCookieRef.js';
  import MasterContainer from './components/layout/MasterContainer.vue';

  const userCookie = useCookieRef('user') // OK: inside a component
  provide('userCookie', userCookie)
</script>

<template>
  <MasterContainer ></MasterContainer>
</template>

<style>
</style>


