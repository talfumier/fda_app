<script setup>
  import { ref, watch, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'  
  import { useQuasar } from 'quasar'
  import quasarLangFr from 'quasar/lang/fr.js'
  import quasarLangEn from 'quasar/lang/en-GB.js'
  import frFlag from '../../../assets/images/fr.png'
  import ukFlag from '../../../assets/images/uk.png'

  const props = defineProps({
    preferred: { type: String }
  })

  const route = useRoute()
  const router = useRouter()
  const $q = useQuasar()
  const { locale } = useI18n()

  const quasarLangs = {
    fr: quasarLangFr,
    en: quasarLangEn,
  }

  const langOptions = [
    {
      label: 'Français',
      value: 'fr',
      img: frFlag,
      alt: 'drapeau FR'
    },
    {
      label: 'English',
      value: 'en',
      img: ukFlag,
      alt: 'UK flag'
    }
  ]

  const selectedLocale = ref(route.params && route.params.locale?route.params.locale:(props.preferred || localStorage.getItem('locale')))

  watch(selectedLocale, (val) => {
    if (!val) return
    localStorage.setItem('locale', val)
    // Cas 1 : routes publiques localisées
    if (route.params.locale) {
      if (val === route.params.locale) return
      const newPath = route.fullPath.replace(/^\/(fr|en)(?=\/|$)/, `/${val}`)
      router.push(newPath)
      return
    }
    // Cas 2 : routes membre non localisées
    locale.value = val
    $q.lang.set(quasarLangs[val])
    document.documentElement.lang = val
  })

  watch(
    () => route.params.locale,
    (newLocale) => {
      if (newLocale && newLocale !== selectedLocale.value) {
        selectedLocale.value = newLocale
      }
      if (newLocale && quasarLangs[newLocale]) {
        $q.lang.set(quasarLangs[newLocale])
      }
    },
    { immediate: true }
  )

  const selectedOption = computed(() => {
    return langOptions.find(opt => opt.value === selectedLocale.value) || langOptions[0]
  })
</script>

<template>
  <q-select
    v-model="selectedLocale"  
    class="q-select"
    :options="langOptions"
    emit-value
    rounded standout
    map-options
    outlined
    options-dense
    dense
    bg-color="grey-3"
    tabindex="-1"
  >
    <template v-slot:selected >
      <div class="row items-center no-wrap q-pa-xs q-selected" >
        <img :src="selectedOption.img" :alt="selectedOption.alt"/>
        <div v-if="$q.screen.width>930">{{ selectedOption.label }}</div>
      </div>
    </template>
    <template v-slot:option="scope" class="q-item">
      <q-item v-bind="scope.itemProps" >
        <q-item-section avatar>
          <img :src="scope.opt.img" :alt="scope.opt.alt" />
        </q-item-section>
        <q-item-section v-if="$q.screen.width>930" >{{ scope.opt.label }}</q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<style scoped >
.q-select {
  width:80px;
  padding:0;
  font-size:1.5rem;
}
.q-selected {
  font-weight: bolder;
  color:blue;
}
.q-item {  
  font-weight: bolder;
}
img {
  width:25px;
  height:15px;
  margin-right: 10px;
}
@media screen and (min-width: 850px) {   
  .q-select {
    width:100%;
  }
} 
</style>