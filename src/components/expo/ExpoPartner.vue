<script setup>
  import {ref,watch,inject,onMounted,onUnmounted} from 'vue'
  import _ from 'lodash'
  import { getEntitiesBySql,postEntity,deleteEntity } from '@/services/httpEntities.js'
  import { newController,doneController,cancelAllInFlight, getRandomInt } from '@/utilityFunctions.js'
  import GenericTable from './GenericTable.vue'
  import FieldsetButton from '../common/page/details/FieldsetButton.vue'

  const props=defineProps({
    idExpo:{type:Number}
  })

  const {token}=inject('userCookie')
  const state=ref([])
  let initialValues=null
  const inFlight=new Set()

  const emit=defineEmits(['tabUnsaved'])

  const columns=[
    {name:'selected',field:'selected',align:'left'},
    {name:'idPartner',field:'idPartner',align:'left'},
    {name:'name',field:'name',headerClasses: 'col-name'},
    {name:'url',field:'url'}]
  const visible=['selected','name','url']

  async function fetch(signal){
    const {data:res}=await getEntitiesBySql(
      'list_expo_partner',
      token.value,
      signal,
      ':idExpo',
      props.idExpo
    )
    if(res.statusCode===200) return res.data
  }
  function initSelected(){
    state.value.map((tbl) => {
      tbl.map((row,idx) => {
        return tbl[idx]={...row,selected:false}
      })
    })
  }
  onMounted(async () => {  
    const ctrl=newController(inFlight)
    try {
      state.value = await fetch(ctrl.signal) 
      initialValues=_.cloneDeep(state.value[1])  //selected property not in initialValues
      initSelected()
    } catch (error) {
      console.error('onmounted failed in ExpoPartner.vue', error)
      return
    }
    finally {
      doneController(ctrl,inFlight)
    }
  })
  onUnmounted(() => { // clean-up code after component has unmounted  
    cancelAllInFlight(inFlight)
  })  
  const disabled=ref([true,true,true])
  function isEqual(arr1,arr2){
    const arr=arr1.map((row) => {
      const {selected,...obj}=row
      return obj
    })
    return _.isEqual(arr,arr2)
  }
  watch(() => {
    if(state.value.length>0) return state.value[1]
  }, (newValue, oldValue) => {
    const cond=isEqual(_.cloneDeep(state.value[1]),initialValues)  
    disabled.value[2]=cond //bottom action button disabled condition
    if(!cond) emit('tabUnsaved',true)  //track actual changes
  }, { deep: true, immediate: false })

  function handleSelected(cs,val){
    switch(cs){
      case 'left':
        disabled.value[0]=val?false:true
        break
      case 'right':
        disabled.value[1]=val?false:true
    }
  }
  function handleClick(cs){
    const from=cs==='left'?0:1
    const to=cs==='left'?1:0       
    const idx=state.value[from].findIndex((row) => {
      return row.selected
    })
    state.value[to].push(state.value[from][idx])
    state.value[from]=_.filter(state.value[from],(row,i) => {
      return !row.selected
    })
    initSelected()
    disabled.value=[true,true,disabled.value[2]]
  }
  function handleSave(){
    const post=[],del=[]
    state.value[1].forEach((row) => {
      const idx=initialValues.findIndex((item) => {
        return item.idPartner===row.idPartner
      })
      if(idx===-1) post.push({idExpo:props.idExpo,idPartner:row.idPartner})
    }) 
    initialValues.forEach((row) => {
      const idx=state.value[1].findIndex((item) => {
        return item.idPartner===row.idPartner
      })
      if(idx===-1) del.push(row.ID)
    })  
    const ctrl=newController(inFlight),bls=[]
    try { 
      del.forEach(async(id) => {
        const {data:res}=await deleteEntity('ExpoPartner',id,token.value, ctrl.signal)
        bls.push(res.statusCode===200?true:false)
      })
      if(JSON.stringify(bls).includes(false)) return
      post.forEach(async(body) => {
        const {data:res}=await postEntity('ExpoPartner',body,token.value, ctrl.signal)
        bls.push(res.statusCode===200?true:false)
      })
      if(!JSON.stringify(bls).includes(false)){
        initialValues=_.cloneDeep(state.value[1]) 
        disabled.value[2]=true
      }     
    } catch (error) {}
    finally {
      doneController(ctrl,inFlight)
    }  
  }

</script>

<template>
  <div class="top-container">
    <div class="tables-container">
      <div class="container left">      
        <q-btn class='left' round flat icon="input" size="2rem" color="primary" 
          :disable="disabled[0]"
          @click="() => {
            handleClick('left')
          }"
        >        
        </q-btn>
        <GenericTable v-if="state.length>0"
          :key="getRandomInt(1e2,1e5)"
          :title="$t('comps.form_details.expos.tables.partner-left.title')"
          :data="state[0]"
          :columns="columns"
          :visible="visible"
          rowKey='idPartner'
          @selected="(val) => {
            handleSelected('left',val)
          }"
        >
          <template #body="slotProps">
            <q-td>
              {{ slotProps.row.name }}
            </q-td>
            <q-td>
              <img v-if="slotProps.row.url" :src="slotProps.row.url" :alt="slotProps.row.name">
            </q-td>
          </template>
        </GenericTable>      
      </div>
      <div class="container right">      
        <q-btn class='right' round flat icon="input" size="2rem" color="primary" 
          :disable="disabled[1]"
          @click="() => {
            handleClick('right')
          }"
        >        
        </q-btn>
        <GenericTable v-if="state.length>0"
          :key="getRandomInt(1e2,1e5)"
          :title="$t('comps.form_details.expos.tables.partner-right.title')"
          :data="state[1]"
          :columns="columns"
          :visible="visible"
          rowKey='idPartner'
          @selected="(val) => {
            handleSelected('right',val)
          }"
        >
          <template #body="slotProps">
            <q-td>
              {{ slotProps.row.name }}
            </q-td>
            <q-td>
              <img v-if="slotProps.row.url" :src="slotProps.row.url" :alt="slotProps.row.name">
            </q-td>
          </template>
        </GenericTable> 
      </div>
    </div>
    <div class="bottom-container">
      <FieldsetButton  
        :buttons="[{
            name: 'save',
            icon:'save',
            label_fr: 'Enregistrer',
            label_en: 'Save'
          }]"  
        :disabled="{save:disabled[2]}"
        @button-action="handleSave"      
      >
      </FieldsetButton>
    </div>
  </div>
</template>

<style scoped>
  td, tr {
    max-height:2rem;
  }
  div.tables-container {
    display:flex;
    flex-wrap: wrap;
    justify-content: space-evenly;
    align-items: center;
    gap:20px;
    width:100%;
    margin-top:50px;
  }
  div.container {
    position:relative;
  }
  div.container.left ::v-deep(.q-table__top){
    justify-content: left;
  }
  div.container.right ::v-deep(.q-table__top){
    justify-content: right;
  }  
  .q-btn {
    position:absolute;
    top:0px;
    z-index: 1000;  
  }
  .q-btn.left {
    right:0;
  }
  .q-btn.right {
    left:0;
    transform: rotate(180deg);
  }
  img {
    height:35px;
    object-fit: cover;
  }
  div.q-table__container {
    border:1px solid grey;
  }
  div.bottom-container {
    display: flex;
    justify-content: center;
    width:100%;
    padding-top:20px;
  }

</style>