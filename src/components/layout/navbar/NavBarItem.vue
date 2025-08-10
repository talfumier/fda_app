<script setup>
  import Tooltip from '../../common/Tooltip.vue';
  defineProps({
    url:{type:String},
    icon:{type:String},
    text:{type:String},
    isRotated:{type:Boolean},
    wrap:{
      type:Boolean,
      default:false,
    },
  })

</script>

<template>
  <RouterLink :to="url">
    <Tooltip :class="isRotated?'visible':'hidden'" :tt_text="$t(text)" ></Tooltip>
    <q-icon :name="icon" size="3rem"></q-icon>
    <p :class="[isRotated?'folded':'',wrap?'':'nowrap']">{{ $t(text) }}</p>
  </RouterLink>
</template>

<style>
  .tooltip.visible {
    overflow: visible;
  }
  .tooltip.hidden {
    overflow: hidden;
  }
</style>
<style scoped>
  .q-icon {    
    padding: 0 10px;
    text-align: center;
  }
  p {
    display:inline-block;  
    margin:0;
    transition: display 0.6s ease;
  }
  p.nowrap {
    white-space: nowrap;
  }
  p.folded {
    display:none;
  }
  a {
    color: var(--white);
    text-decoration: none;
    display: block;
    border-radius: 4px;
  }
  a:hover {
    color: var(--red);
    font-weight:bolder;
    background-color: var(--beige-opaque8);
  }
</style>