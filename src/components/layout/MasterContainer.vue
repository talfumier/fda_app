<script setup> 
  import { computed } from 'vue'
  import { useRoute} from 'vue-router'
  import { useHead } from '@unhead/vue'
  import MasterLayout from "./MasterLayout.vue"
  import PrintLayout from "./PrintLayout.vue"
  import Footer from './footer/Footer.vue' 

  const route=useRoute()
  const isPrint = computed(() =>
    String(route.name ?? '').includes('_print')
  )
  // Search Engine Optimisation
  const siteUrl = 'https://festivaldesarts.merville31.fr'
  const normalizedPath = computed(() => {
    let path = route.path || '/'
    if (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1)
    }
    return path
  })
  const isMemberPage = computed(() => normalizedPath.value.startsWith('/member'))
  const isTestHost = computed(() => window.location.hostname === 'test.festivaldesarts.merville31.fr')
  const shouldNoindex = computed(() => isMemberPage.value || isPrint.value || isTestHost.value)
  const canonicalUrl = computed(() => `${siteUrl}${normalizedPath.value}`)

  useHead(() => ({
    meta: shouldNoindex.value?[{ name: 'robots', content: 'noindex,nofollow'}]:[],
    link: !shouldNoindex.value?[{ rel: 'canonical', href: canonicalUrl.value}]:[],
  }))
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