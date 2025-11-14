<script setup>
  import { useI18n } from 'vue-i18n'

  const props = defineProps({
    data:{type:Array}
  })
  
  const {locale}=useI18n()
  const text={250:'created',251:'draft',26:"published"}
  const status={...text,25:'draft'}
  function getTextIndex(statusID,idx){
    switch(statusID){
      case 25:
        if(idx===props.data.length-1) return 250
        else return 251
      default:
        return statusID
    }
  }
</script>

<template>  
  <div v-if="data.length>=1">
    <p :class="['type',data[0].idStatus===25?'warning':'green']" >
      <span>{{ $t(`comps.list_items.actions_menu.faq.${status[data[0].idStatus]}`)}}</span> 
    </p>
    <p v-for="(item,idx) in data" :key="idx" class="date">
      <span >{{ $t(`comps.list_items.actions_menu.faq.${text[getTextIndex(item.idStatus,idx)]}`)}}</span>
      <span>:&nbsp</span>    
      <span >{{$formatDateTime(item.createdAt)}}</span>
    </p>
  </div>

</template>

<style scoped>
  .green {
    color:var(--green)
  }
  .warning {
    color:var(--orange)
  }
  .red {
    color:var(--red)
  }
  p {    
    font-size:1.3rem;
    text-wrap: nowrap;
  }
  p.type {
    font-weight:bolder;
    text-align: center;
    text-transform: capitalize;
    font-style: italic;
    margin:0;
  }
  p.date {
    font-weight: lighter;
    text-align: left;
    margin:0px auto 3px 10px;
  }

</style>