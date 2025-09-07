<script setup>
  import { ref, reactive } from 'vue';

  defineProps({
    path:{type:String}
  })

</script>

<template>
  <q-btn 
    push round pulse flat
    icon="info"
    @click="menu = true" />
  <q-menu v-model="menu">
    <q-card>
      <q-card-section>
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
</style>