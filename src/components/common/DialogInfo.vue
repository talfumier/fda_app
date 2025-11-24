<script setup>
  import { ref } from 'vue';

  defineProps({
    path:{type:String},
    color:{type:String}
  })
  const menu=ref(null)

</script>

<template>
  <q-btn 
    push round pulse flat
    icon="info"
    :color="color?color:''"
    @click="menu = true" />
  <q-menu >
    <q-card>
      <q-card-section :class="[menu?'visible':'hidden',color==='negative'?color:'']">
        {{ $t(path) }}
      </q-card-section>
    </q-card>
  </q-menu>
</template>

<style scoped>
  .q-card {
    max-width: 300px;
  }
  .q-card__section {
    padding:5px 10px;
  }
  .q-card__section.negative {
    color:red;
    font-weight: bolder;
  }
  .q-card-section.visible {
    display:block;
  }
  .q-card-section.hidden {
    display:none;
  }
</style>