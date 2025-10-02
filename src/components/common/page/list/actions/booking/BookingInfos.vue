<script setup>
  const props = defineProps({
    data:{type:Array}
  })
  const text={7:'created',8:'candidate',9:'rejected',10:'accepted'}
  const status={...text,7:'draft'}
</script>

<template>
  <div v-if="data.length>=1">
    <p :class="['booking',data[0].idStatus===7 || data[0].idStatus===8?'warning':(data[0].idStatus===10?'green':'red')]" >
      <span>{{ $t(`comps.list_items.actions_menu.booking.${status[data[0].idStatus]}`)}}</span> 
    </p>
    <p v-for="(item,idx) in data" :key="idx" class="date">
      <span >{{ $t(`comps.list_items.actions_menu.booking.${text[item.idStatus]}`)}}</span>
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
  p.booking {
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