<script setup>
  import {computed } from 'vue'

  const props=defineProps({
    data:{type:Object}
  })
  
  const show=computed(() => {
    let obj={idLoc_rounded:false,idLoc_icon:false,plus:false,screen:false}
    if(props.data.showRoom>0 && props.data.screen===0) obj.idLoc_rounded=true
    if(props.data.screen>0) obj={...obj,idLoc_icon:true,screen:true,plus:props.data.showRoom>0?true:false}
    return obj
  })
  const color=computed(() => {
    switch(props.data.bookingOeuvres[0].idDomain){
      case 4:
        return 'var(--blue-navbar)'
      case 3:
      case 5:
        return 'var(--orange)'
      default:        
        return 'var(--green)'
    }    
  })
</script>

<template>
  <div v-if="data.idLoc" class="wrapper":key="data.idLoc">
    <div v-if="show.idLoc_rounded" class="idLoc_rounded" :style="`background-color:${color};`">{{ data.idLoc }}</div>
    <div v-if="show.idLoc_icon" class="idLoc_icon" :style="`background-color:${color};`">{{ data.idLoc }}
      <q-icon  v-if="show.plus" class="plus" name="add" size="2rem" :style="`color:${color};`"></q-icon>
      <q-icon  v-if="show.screen" class="screen" name="desktop_windows" size="3rem" :style="`color:${color};`"></q-icon>
    </div>
  </div>
</template>

<style scoped>
  div.wrapper {
    margin:15px auto;    
    font-family: "Roboto", sans-serif;
    font-size: 15px;
  }
  div.idLoc_rounded {
    display:flex;
    justify-content: center;
    align-items: center;
    width:30px;
    height:30px;
    border-radius: 50%;
    color:white;
  }  
  div.idLoc_icon {
    position:relative;
    color:white;
    width:24px;
    height:17px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  div.idLoc_icon .q-icon {
    position:absolute;
  }
  div.idLoc_icon .q-icon.screen {
    top:-5px;
  } 
  div.idLoc_icon .q-icon.plus {
    top:-2px;
    left:-22px;
    font-weight: bolder;
  } 

</style>