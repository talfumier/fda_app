<script setup>

  const props=defineProps({
    data:{type:Object,required:true}
  })

</script>

<template>
  <div  class="edit-menu-container">
    <div class="date">
      <span>{{ $t('comps.list_items.edit_menu.last_change')}}</span>
      :&nbsp;
      <span>{{$formatDateTime(data.updatedAt)}}</span>
    </div>
    <div class="menu">
      <div class="edit">
        <q-icon name="edit" size="2rem"/>
        <span>{{ $t('comps.list_items.edit_menu.edit') }}</span>  
      </div>
      <div class="delete">
        <q-icon name="delete" size="2rem"/>
        <span>{{ $t('comps.list_items.edit_menu.delete') }}</span>
      </div>
    </div>      
  </div>  
</template>

<style scoped>
  .edit-menu-container {
    display:flex;
    flex-direction: column;
    font-size:1.4rem;
    padding:0 30px;
    min-width: 200px;
    max-width: 250px;
  }
  .date {
    font-size:1.3rem;
    font-weight: lighter;
    text-align: center;
    text-wrap: nowrap;
    margin:5px auto 3px;
  }
  .menu {
    display: flex;
    justify-content: space-between;
  }
  .menu div {    
    cursor: pointer;
  }
  .edit {    
    color:var(--blue);
  }
  .delete {    
    color:var(--red-opaque8);
  }

</style>