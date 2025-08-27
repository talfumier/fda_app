<script setup>
  import {defineEmits} from 'vue'

  const props=defineProps({
    id:{type:Number},
    checked:{type:Boolean}
  })

  const emit=defineEmits(['selectionChange'])
  
  function handleChange(e){
    emit('selectionChange',e.target.checked)
  } 

</script>

<template>
  <div>
    <slot name="label"></slot>   
    <input
        :id="id"
        type="checkbox"
        :checked="checked"
        @change="handleChange"
      />
  </div>
</template>

<style scoped>
  div {
    display:flex;
    flex-direction: row-reverse;
    justify-content: left;    
    align-items: center;
    margin-top: 10px;
  }
  label {
    color:var(--black-opaque9);
    text-wrap: nowrap;
    cursor: pointer;
  }
  input {
    transform: scale(1.5);
    margin:0px 10px 20px 5px;
    width: fit-content;
    cursor: pointer;
  }
</style>