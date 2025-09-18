<script setup>
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
      :icon="button.icon"
      :label="button[`label_${locale}`]"
      :disabled="false"
      @click="emit('buttonAction',button.name)"
    >
    </q-btn>
</template>

<style scoped>
  .q-btn {
    max-height: 3.6rem;
    margin:0 20px;
  }

</style>