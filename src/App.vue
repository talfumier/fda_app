<script setup>
  import { Notify } from 'quasar'
  import { provide } from 'vue';
  import { useCookieRef } from './composable/useCookieRef.js';
  import { initToast } from './composable/toast.js';
  import MasterContainer from './components/layout/MasterContainer.vue';

  const userCookie = useCookieRef('user') // OK: inside a component
  provide('userCookie', userCookie)

  initToast(Notify)

</script>

<template>
  <MasterContainer ></MasterContainer>
</template>

<style>
</style>


