<script setup>
  import { defineEmits } from 'vue';
  import { useI18n } from 'vue-i18n'

  const props=defineProps({
    buttons:{type:Array}
  })
  const {locale}=useI18n()
  const emit=defineEmits(['buttonAction'])
  
</script>

<template>
    <q-btn 
      v-for="(button,idx) in buttons"
      class="button"
      color='primary'
      rounded standout pulse
      no-wrap
      :label="button[`label_${locale}`]"
      :disabled="false"
      @click="emit('buttonAction',button.name)"
    >
    </q-btn>
</template>

<style scoped>

</style>