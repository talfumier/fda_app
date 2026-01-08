<script setup>
  import { useI18n } from 'vue-i18n'

  const props = defineProps({
    buttons: {type: Array},
    disabled:{type:Object},
    pulse:{type:Boolean,default:false}
  })

  const { locale } = useI18n()
  const emit = defineEmits(['buttonAction'])

</script>

<template>
  <q-btn
    v-for="(button, idx) in buttons"
    :key="button.name"
    :class="['button',pulse?'pulse':''] "
    color="primary"
    rounded standout pulse
    no-wrap
    :disable="disabled[button.name]"
    :icon="button.icon"
    :label="button[`label_${locale}`]"
    @click="emit('buttonAction', button.name)"
  />
</template>

<style scoped>
  .q-btn {
    max-height: 3.6rem;
    margin:0 20px;
  }
  @keyframes pulse {
  0%   { box-shadow: 0 0 0 0 rgba(0,0,0,.0) }
  40%  { box-shadow: 0 0 0 8px rgba(25,118,210,.25)  } /* adjust color */
  100% { box-shadow: 0 0 0 0 rgba(0,0,0,.0) }
  }
  .pulse { animation: pulse 1.2s ease-out infinite }

</style>