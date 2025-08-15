<script setup>
  defineProps({
    tt_text:String,
    small:{
      type:Boolean,
      default:true
    },
    wrap:{
      type:Boolean,
      default:false
    },
  })
</script>

<template>
<q-tooltip 
  :class="['tooltip', small ? 'small' : 'large', wrap?'':'nowrap']"
  anchor="bottom middle"
  self="center middle"
  >
    <slot>{{ tt_text }}</slot>
  </q-tooltip>
</template>

<style>
  .tooltip {
    background-color: var(--black-opaque9);
    color: var(--white);
    padding: 5px 12px;
    border-radius: 6px;
  }
  .nowrap {
    white-space: nowrap;
  }
  .large {    
    font-size: 1.5rem;
  }
  .small {    
    font-size: 1.2rem;
  }
  </style>