<script setup>
const {tt_text}=defineProps({
  tt_text:String
})

</script>

<template>
<q-tooltip 
      class="tooltip"
      anchor="bottom middle"
      self="center middle"
      >
        {{ tt_text }}
    </q-tooltip>
</template>

<style>
  .tooltip {
    background-color: var(--black-opaque9);
    color: var(--white);
    padding: 5px 12px;
    border-radius: 6px;
    font-size: 1.5rem;
  }
</style>