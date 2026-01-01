<script setup>
  import { Pie } from "vue-chartjs"

  const props=defineProps({
    data:{type:Object},
    size:{type:Number},
    options: { type: Object, required: true },
  })

</script>

<template>
  <div class="pie-wrapper" :style="{ width: `${size}px`, height: `${size}px` }">
    <Pie :data="data" :options="options" :width="size" :height="size" />
  </div>

</template>

<style scoped>
  .pie-wrapper {
    display:flex;
    justify-content: center;
    padding-bottom: 10px;
  }

</style>