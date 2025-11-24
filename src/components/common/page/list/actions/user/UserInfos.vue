<script setup>
  import { useI18n } from 'vue-i18n'
  const props = defineProps({
    role:{type:Object},
    data:{type:Array}
  })
  const {locale}=useI18n()
  const text={1:'created',2:"validated",3:"deactivated"}
</script>

<template>
  <div>
    <p :class="['role',data[0].idStatus===1?'warning':(data[0].idStatus===2?'green':'red')]" >
      <span>{{ role[`role_${locale}`] }}</span> 
    </p>
    <p v-for="(item,idx) in data" :key="idx" class="date">
      <span >{{ $t(`comps.list_items.actions_menu.user.${text[item.idStatus]}`)}}</span>
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
  p.role {
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