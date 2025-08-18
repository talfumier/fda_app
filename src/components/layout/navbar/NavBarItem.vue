<script setup>
  import Tooltip from '../../common/Tooltip.vue';

  defineProps({
    url:{type:String},
    icon:{type:String,required:false},
    text:{type:String},
    isRotated:{type:Boolean,default:false}, 
    wrap:{ type:Boolean,default:false},  //tooltip wrap
  })
</script>

<template>
  <RouterLink :to="url" tabindex="-1">
    <Tooltip :class="isRotated?'visible':'hidden'" :tt_text="$t(text)" :wrap="wrap"></Tooltip>
    <div :class="[isRotated?'folded':'']">
      <q-icon v-if="icon" :name="icon" size="3rem"></q-icon>
      <p>{{ $t(text) }}</p>
    </div>
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
  div {
    display:flex;
    align-items: center;
    justify-content:left;
  }
  div.folded {
    justify-content:center;
  }
  .q-icon {  
    padding-right: 10px;  
    padding-left: 5px;
    text-align: center;
  }
  div.folded .q-icon {
    padding:0;
  }
  p {
    margin:0;
    transition: display 0.6s ease;
  }
  div.folded p {
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