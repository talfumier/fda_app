<script setup>
  import {ref,defineEmits} from 'vue'
  import CheckBox from '../../fields/CheckBox.vue';
  import EditMenu from './EditMenu.vue';

  const props=defineProps({
    name:{type:String},
    master:{type:Array},
    data:{type:Array},
  })

  const emit=defineEmits(['openDetails'])

  const selected=ref({})
  props.data.map((item) => {
    selected.value={...selected.value,[item[`id${props.name}`]]:false}
  })
  function handleSelectionChange(val,id){
    const keys=Object.keys(selected.value)
    keys.map((key) => {
      selected.value[key]=(key==id?val:false)
    })
    emit('openDetails',val?id:null)  //if id not null populate FormDetails, if id null empty FormDetails
  }
  
</script>

<template>
  <div v-for="(item,idx) in data">      
    <div :key="idx" class="list-item">
      <CheckBox
        :id="idx"
        :label="item[master[0].name]"
        :checked="selected[item[`id${name}`]]"
        @selection-change="(val) => {
          handleSelectionChange(val,item[`id${name}`])
        }"
      >
      </CheckBox>
      <EditMenu
        v-if="selected[item[`id${name}`]]"
        :data="{id:item[`id${name}`],updatedAt:item.updatedAt}"
      >
      </EditMenu>
    </div>
  </div>
</template>

<style scoped>  
  .list-item {
    display:flex;
    flex-direction: column;
    font-size: 1.6rem;
    font-weight: bolder;
    margin: 0 10px;
  }

</style>