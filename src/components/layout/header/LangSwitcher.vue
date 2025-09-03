<script setup>
import { ref, watch,computed } from 'vue'
import { useQuasar} from 'quasar'
import { useI18n } from 'vue-i18n'
import quasarLangFr from 'quasar/lang/fr.js'
import quasarLangEn from 'quasar/lang/en-GB.js'
import frFlag from '../../../assets/images/fr.png'
import ukFlag from '../../../assets/images/uk.png'

const { locale } = useI18n()
const $q = useQuasar()
const quasarLangs = {
  fr: quasarLangFr,
  en: quasarLangEn,
}
const langOptions = [
  {
    label: 'Français',
    value: 'fr',
    img: frFlag,
    alt:"drapeau FR"
  },
  {
    label: 'English',
    value: 'en',
    img: ukFlag,
    alt:"UK flag"
  }
]
const selectedLocale = ref(locale.value)
// sync with Vue I18n and Quasar on change
watch(selectedLocale, (val) => {
  locale.value = val
  localStorage.setItem('locale', val)
    $q.lang.set(quasarLangs[val])
})
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
        {{ selectedOption.label }}
      </div>
    </template>
    <template v-slot:option="scope" class="q-item">
      <q-item v-bind="scope.itemProps" >
        <q-item-section avatar>
          <img :src="scope.opt.img" :alt="scope.opt.alt" />
        </q-item-section>
        <q-item-section >{{ scope.opt.label }}</q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<style scoped >
.q-select {
  width:150px;
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
</style>