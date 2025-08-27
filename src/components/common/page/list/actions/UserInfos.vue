<script setup>
  defineProps({
    data:{type:Array}
  })
  const text={1:'created',2:"validated",3:"deactivated"}

</script>

<template>
  <div>
    <p v-for="(item,idx) in data" :key="idx" class="date">
      <span >{{ $t(`comps.list_items.actions_menu.user.${text[item.idStatus]}`)}}</span>
      <span>:&nbsp</span>    
      <span >{{$formatDateTime(item.createdAt)}}</span>
    </p>
  </div>

</template>

<style scoped>
  p {
    font-size:1.3rem;
    font-weight: lighter;
    text-align: left;
    text-wrap: nowrap;
    margin:5px auto 3px 10px;
  }

</style>