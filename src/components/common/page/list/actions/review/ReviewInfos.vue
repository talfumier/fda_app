<script setup>
  const props = defineProps({
    data:{type:Array}
  })
  
  const text={28:'candidate',29:'published',30:'rejected'}
  const status={...text,28:'candidate'}
  
</script>

<template>
  <div v-if="data.length>=1">
    <p :class="['comment',data[0].idStatus===28?'warning':(data[0].idStatus===29?'green':'red')]" >
      <span>{{ $t(`comps.list_items.actions_menu.comment.${status[data[0].idStatus]}`)}}</span> 
    </p>
    <p v-for="(item,idx) in data" :key="idx" class="date">
      <span >{{ $t(`comps.list_items.actions_menu.comment.${text[item.idStatus]}`)}}</span>
      <span>:&nbsp</span>    
      <span >{{$formatDateTime(item.createdAt)}}</span>
    </p>
  </div>
</template>

<style scoped>
  div {
    display:flex;
    flex-direction: column;
    align-items: center;
    width:fit-content;
  }
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
  p.comment {
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