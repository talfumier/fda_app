<script setup async>
  import { ref,computed,onMounted,onUnmounted  } from 'vue';
  import _ from 'lodash'
  import { getEntities } from '@/services/httpEntities.js';
  import ListItems from './ListItems.vue';
  import FormDetails from './FormDetails.vue';

  const {entity,fields}=defineProps({
    entity:{type:Object},
    fields:{type:Array},
  })

  const field_master=ref([])
  field_master.value=_.filter(fields, (fld) => {
    return fld.listMaster !== undefined
  })
  
  const data=ref(null)
  const filtered=ref([])  

  function handleOpenDetails(id){
    filtered.value= _.filter(data.value,(item) => {
      return item[`id${entity.name}`]==id
    })
  }

  // data loading
  let ctrl // current AbortController
  let alive = true // guard against updates after unmount
  async function fetch() {
    if (ctrl) ctrl.abort()
    ctrl = new AbortController()
    const res=(await getEntities(entity.name,ctrl.signal))
    if (!alive) return                // component gone? don't touch state  
    return res.data.data
  }  
  onMounted(async () => {  
    data.value =  _.orderBy(await fetch(),[entity.orderBy.field],[entity.orderBy.order])  
  })
  onUnmounted(() => { alive = false; ctrl?.abort() })    // clean-up code after component has unmounted

  //fold button
  const isRotated = ref(false)
  function rotateIcon() {
    isRotated.value=!isRotated.value
  }
</script>

<template>
  <div v-if="data" :class="['master-container',isRotated?'folded':'']">
    <q-icon 
      class="btn-fold" 
      name="keyboard_double_arrow_left" 
      size="md"
      @click="rotateIcon"
    >
    </q-icon>
    <div :class="['list-container',isRotated?'folded':'']">
      <ListItems 
        :name="entity.name"
        :master="field_master"
        :data="data"
        @open-details="handleOpenDetails"
      >
      </ListItems>
    </div>
    <div v-if="filtered.length>0" class="details-container">
      <FormDetails :entity="entity" :fields="fields" :filtered="filtered">
      </FormDetails>
    </div>
  </div>
</template>

<style scoped>
  .master-container {
    display: grid;
    grid-template-columns: auto auto;
    grid-template-rows:75px auto;
    justify-content: left;
    height:100%;   
  }  
  .master-container.folded {
    grid-template-columns: 40px auto;
  }
  .btn-fold {    
    grid-area: 1/1;
    justify-self: right;
    align-self: self-end;
    width:40px;
    height:30px;    
    border-radius: 5px;    
    color:var(--orange);
    background-color: red;
    cursor: pointer;
  }
  .master-container .btn-fold { 
    margin: 10px;
    transform: rotate(0deg);
    transition: rotate 0.6s ease;
  }
  .master-container.folded .btn-fold {
    margin: 10px 0;
    transform: rotate(-180deg);
  }
  .list-container {
    grid-area: 2/1;      
    border-top: 1px solid lightgrey;
    visibility:visible;  
    opacity:1;              
    transition: opacity 0.6s ease, visibility 0.6s ease;
  }
  .list-container.folded {
    opacity:0;
    visibility:hidden;
  }
  .details-container {
    grid-row: 1/span 2;
    grid-column: 2;
    border: 1px solid lightgrey;
  }
  div.folded .details-container {
    border-width: 0;
  }

</style>