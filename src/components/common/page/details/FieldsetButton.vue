<script setup>
  import { useI18n } from 'vue-i18n'

  const props = defineProps({
    buttons: {type: Array},
    disabled:{type:Object}
  })

  const { locale } = useI18n()
  const emit = defineEmits(['buttonAction'])

</script>

<template>
  <q-btn
    v-for="(button, idx) in buttons"
    :key="button.name"
    :class="['button'] "
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

</style>