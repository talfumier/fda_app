<script setup>

  const props=defineProps({
  })

</script>

<template>
  <div  class="edit-menu-container">
    <slot name="infos"></slot>
    <slot name="actions"></slot>   
  </div>  
</template>

<style scoped>
  .edit-menu-container {
    display:flex;
    flex-direction: column;
    font-size:1.4rem;
    padding:0 30px;
    min-width: 200px;
    max-width: 250px;
  }
</style>