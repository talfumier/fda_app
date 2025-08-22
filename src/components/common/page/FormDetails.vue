<script setup>
  import { ref, reactive } from 'vue';

  const props=defineProps({
    entity:{type:Object},
    fields:{type:Object},
    filtered:{type:Array}
  })

  console.log("FormDetails",props.filtered, props.filtered.length)

</script>

<template>

</template>

<style scoped>

</style>