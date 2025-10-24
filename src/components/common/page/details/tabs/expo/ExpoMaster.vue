<script setup>
  import {ref,watch,inject,onMounted,onUnmounted} from 'vue'
  import _ from 'lodash'
  import { getEntitiesBySql,postEntity,deleteEntity } from '@/services/httpEntities.js'
  import { newController,doneController,cancelAllInFlight, getRandomInt } from '@/utilityFunctions.js'
  import GenericTable from './GenericTable.vue'
  import FieldsetButton from '../../FieldsetButton.vue'

  const props=defineProps({
    entity:{type:String},
    idExpo:{type:Number},
    relatedIdModel:{type:Array},
    idRole:{type:Number},
    sql:{type:String},
    columns:{type:Array},
    visible:{type:Array},
    titles:{type:Array} //table titles
  })

  const {token}=inject('userCookie')
  const state=ref([])
  let initialValues=null
  const inFlight=new Set()

  const emit=defineEmits(['tabUnsaved'])

  async function fetch(signal){
    const {data:res}=await getEntitiesBySql(
      props.sql,
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
      console.error('onmounted failed in ExpoMaster.vue', error)
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
      let cond=true
      const idx=initialValues.findIndex((item) => {
        props.relatedIdModel.forEach((idModel) => {
          cond=cond && item[idModel]===row[idModel]
        })
        return cond
      })
      if(idx===-1) {
        const obj={idExpo:props.idExpo}
        props.relatedIdModel.forEach((idModel) => {
          obj[idModel]=row[idModel]
          if(props.idRole && idModel==='idRole') obj.idRole=props.idRole
        })
        post.push(obj)
      }
    }) 
    initialValues.forEach((row) => {
      const idx=state.value[1].findIndex((item) => {
        let cond=true
        props.relatedIdModel.forEach((idModel) => {
          cond=cond && item[idModel]===row[idModel]
        })
        return cond
      })
      if(idx===-1) del.push(row.ID)
    })  
    const ctrl=newController(inFlight),bls=[]
    try { 
      del.forEach(async(id) => {
        const {data:res}=await deleteEntity(props.entity,parseInt(id),token.value, ctrl.signal)
        bls.push(res.statusCode===200?true:false)
      })
      if(JSON.stringify(bls).includes(false)) return
      post.forEach(async(body) => {
        const {data:res}=await postEntity(props.entity,body,token.value, ctrl.signal)
        bls.push(res.statusCode===200?true:false)
      })
      if(!JSON.stringify(bls).includes(false)){
        initialValues=_.cloneDeep(state.value[1]) 
        initialValues.map((row) => {  //remove selected property coming from state.value[1]
          delete row.selected
        })
        disabled.value[2]=true
        emit('tabUnsaved',false)
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
          :title="titles[0]"
          :data="state[0]"
          :columns="columns"
          :visible="visible"
          :rowKey="relatedIdModel[0]"
          @selected="(val) => {
            handleSelected('left',val)
          }"
        >
          <template #body="slotProps">
            <q-td>
              {{ slotProps.row[visible[1]] }}
            </q-td>
            <q-td v-if="slotProps.row[visible[2]] && visible[2]!=='url'">
              {{ slotProps.row[visible[2]] }}
            </q-td>
            <q-td>
              <img v-if="slotProps.row.url" :src="slotProps.row.url" :alt="slotProps.row[visible[1]]">
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
          :title="titles[1]"
          :data="state[1]"
          :columns="columns"
          :visible="visible"
          :rowKey="relatedIdModel[0]"
          @selected="(val) => {
            handleSelected('right',val)
          }"
        >
          <template #body="slotProps">
            <q-td>
              {{ slotProps.row[visible[1]] }}
            </q-td>
            <q-td v-if="slotProps.row[visible[2]] && visible[2]!=='url'">
              {{ slotProps.row[visible[2]] }}
            </q-td>
            <q-td>
              <img v-if="slotProps.row.url" :src="slotProps.row.url" :alt="slotProps.row[visible[1]]">
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