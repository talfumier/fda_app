<template>
  <q-select
    v-model="locale"
    :options="languageOptions"
    emit-value
    map-options
    dense
    outlined
    options-dense
    class="q-ma-sm"
    style="width: 160px"
  >
    <template v-slot:selected>
      <div class="row items-center no-wrap">
        <img :src="selectedOption.img" width="20" class="q-mr-sm" />
        {{ selectedOption.label }}
      </div>
    </template>

    <template v-slot:option="scope">
      <q-item>
        <q-item-section avatar>
          <img :src="scope.opt.img" width="20" />
        </q-item-section>
        <q-item-section>{{ scope.opt.label }}</q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

const { locale } = useI18n()
const languageOptions = [
  {
    label: 'Français',
    value: 'fr',
    img: '../assets/icons/fr.svg'
  },
  {
    label: 'English',
    value: 'en',
    img: '../assets/icons/fr.svg'
  }
]
const selectedOption = computed(() => {
  return languageOptions.find(opt => opt.value === locale.value) || languageOptions[0]
})
</script>
