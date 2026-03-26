<script setup>  
  import { useRoute } from 'vue-router'
  import { useI18n } from 'vue-i18n'

  let locale=null
  const route=useRoute()
  if(!route.params?.locale) locale=useI18n().locale
  else locale=route.params.locale

</script>

<template>
  <div class="page-not-found">
    <h2>
      {{ $t('comps.notfound.error') }}&nbsp;404&nbsp;:&nbsp;{{ $t('comps.notfound.text') }}&nbsp;!
    </h2>
    <router-link :to="`/${locale}/home`">{{ $t('comps.notfound.home') }}</router-link>
  </div>

</template>

<style scoped>
  .page-not-found {
    display:flex;
    flex-direction: column;
    margin-top:80px;
    align-items: center;
    font-size:3rem;
  }
  h2 {
    font-weight: 500;
    color:var(--black-opaque9)
  }
  

</style>