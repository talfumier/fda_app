<script setup>
</script>

<template>
  <div>
    <slot name="label"></slot>   
    <slot name="checkbox"></slot>
  </div>
</template>

<style scoped>
  div {
    display:flex;
    flex-direction: row-reverse;
    justify-content: left;    
    align-items:start;
    margin-top: 10px;
  }
</style>