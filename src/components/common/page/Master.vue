<script setup async>
  import { ref,computed,onMounted,onUnmounted  } from 'vue';
  import { useI18n } from 'vue-i18n';
  import _ from 'lodash'
  import { getEntitiesBySql } from '@/services/httpEntities.js';
  import ListItems from './list/ListItems.vue';
  import FormDetails from './details/FormDetails.vue';

  const {entity,fieldsets}=defineProps({
    entity:{type:Object},
    fieldsets:{type:Array},
  })
  const {t}=useI18n()
  //field_master definition, formValid initialization
  const field_master=ref([])
  let fltr=null
  const obj={}
  fieldsets.map((fldset) => {
    fltr=null
    fltr=_.filter(fldset.fields, (fld) => {
      return fld.listMaster !== undefined
    })    
    if(fltr.length>0) field_master.value=[...field_master.value,...fltr]
    fldset.fields.map((fld) => {
      obj[fld.name]=false
    })
  })
  const formValid=ref({...obj})
  const disabled=computed(() => {
    return JSON.stringify(formValid).indexOf(false) !== -1;
  })
  
  const state=ref(null)
  const selectedId = ref(null)
  const filtered = computed(() => {
    const arr = state.value[0] || []
    const id = selectedId.value
    if (id === null) return null
    return arr.find(item => item[`id${entity.model}`] === id)
  })

  function handleOpenDetails(id){
    selectedId.value=id
  }
  function handleChange(id,name,valid,val){
    const idx=state.value[0].findIndex(record => record[`id${entity.model}`] === id)
    state.value[0][idx][name]=val
    formValid.value[name]=valid
  }
  // data loading
  let ctrl // current AbortController
  let alive = true // guard against updates after unmount
  async function fetch() {
    if (ctrl) ctrl.abort()
    ctrl = new AbortController()
    let res=null
    if(entity.sql) res=(await getEntitiesBySql(entity.sql,ctrl.signal)).data
    if (!alive) return                // component gone? don't touch state 
    return res.data
  }  
  onMounted(async () => {  
    state.value = await fetch() 
  })
  onUnmounted(() => { alive = false; ctrl?.abort() })    // clean-up code after component has unmounted
  //fold button
  const isRotated = ref(false)
  function rotateIcon() {
    isRotated.value=!isRotated.value
  }
  //data filtering
  const stateFilter=ref({search:'',user:''})
  const filteredState=computed(() => {
    let cond=[],result=true
    return _.filter(state.value[0],(item) => {
      cond.push(JSON.stringify(item).includes(stateFilter.value.search))
      cond.push(stateFilter.value.user?item.idStatus===2 || item.idStatus===3:
        (stateFilter.value.user===false?item.idStatus===1:item.idStatus>=1))
      cond.map((cnd) => {
        result=result && cnd
      })
      return result
    })
  })
  function getToggleLabel(){
    switch(stateFilter.value.user){
      case true:
        return t('comps.list_items.actions_menu.user.filter.validated') 
      case false:
        return t('comps.list_items.actions_menu.user.filter.pending')
      default:
        return t('comps.list_items.actions_menu.user.filter.indeterminate')
    }
  }
</script>

<template>
  <section v-if="state" :class="['master-container',isRotated?'folded':'']">
    <aside class="top-container" >
      <div class="filter">   
        <q-input
          dense
          filled
          debounce="300"
          v-model="stateFilter.search"
          :placeholder="$t('common.search')"
          hide-bottom-space
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
          <template v-slot:append>
            <q-icon name="cancel" @click="stateFilter.search=''" class="cursor-pointer" />
          </template>
        </q-input>     
        <q-toggle
          v-if="entity.model==='User'"
          v-model="stateFilter.user"
          toggle-indeterminate
          :label="getToggleLabel()"
          color="positive"
          checked-icon="check"
          unchecked-icon="clear"
          size="md"
        />
        <span v-if="!isRotated">{{ `${filteredState.length}/${state[0].length}` }}</span>
      </div>
      <q-icon 
        class="btn-fold"
        name="keyboard_double_arrow_left" 
        size="md"
        @click="rotateIcon"
      >
      </q-icon>
    </aside>
    <aside :class="['list-container',isRotated?'folded':'']">
      <ListItems 
        :model="entity.model"
        :master="field_master"
        :data="filteredState"
        :infos="state.length>1?state[1]:null"
        @open-details="handleOpenDetails"
      >
      </ListItems>
    </aside>
    <form class="details-container">
      <FormDetails 
        v-if="selectedId" 
        :key="selectedId"
        :entity="entity" 
        :fieldsets="fieldsets" 
        :record="filtered"
        @change="handleChange"
        >
      </FormDetails>
    </form>
  </section>
</template>

<style scoped>

  .master-container {
    display: grid;
    grid-template-columns: auto auto;
    grid-template-rows:80px auto;
    justify-content: left;
    height:100%;   
  }  
  .master-container.folded {
    grid-template-columns: 40px auto;
  }
  .top-container {    
    grid-area: 1/1;
    align-self: self-end;   
    display:flex;
    justify-content:right;
    align-items:flex-end;
  }
  .top-container .q-input {
    margin: 0 ;
  }
  .q-icon.btn-fold {
    width:40px;
    height:30px;    
    border-radius: 5px;    
    color:var(--orange);
    background-color: red;
    cursor: pointer;
  }
  .filter {
    position:relative;
    display:flex;
    flex-direction: column;
    align-items: left;    
    border-right: 1px solid lightgrey;
  }
  .filter span {
    position:absolute;
    top: 10px;
    right:-40px;
    font-size:1.3rem;
    text-wrap: nowrap;
  }
  .master-container .btn-fold { 
    margin: 0 10px 5px;
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