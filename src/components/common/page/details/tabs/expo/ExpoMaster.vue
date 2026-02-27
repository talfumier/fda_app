<script setup>
  import {ref,watch,inject,onMounted,onUnmounted} from 'vue'
  import { useI18n } from 'vue-i18n'
  import _ from 'lodash'
  import { getEntitiesBySql } from '@/services/httpEntities.js'
  import { newController,doneController,cancelAllInFlight, getRandomInt,getFileExtension } from '@/utilityFunctions.js'
  import GenericTable from './GenericTable.vue'
  import FieldsetButton from '../../FieldsetButton.vue'
  import FileViewerModal from '../../FileViewerModal.vue'
  import Tooltip from '@/components/common/Tooltip.vue'
  import { isEqual,handleSaveMaster } from './expoFunctions.js'

  const props=defineProps({
    entity:{type:String},
    idExpo:{type:Number},
    relatedFields:{type:Array},
    idRole:{type:Number},
    sql:{type:String},
    columns:{type:Array},
    visible:{type:Array},
    titles:{type:Array} //table titles
  })
  
  const {locale}=useI18n()
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

  watch(() => {
    if(state.value.length>0) return state.value[1]
  }, (newValue, oldValue) => {
    const cond=isEqual(_.cloneDeep(state.value[1]),initialValues) 
    disabled.value[2]=cond //bottom action button disabled condition
    // if(!cond) emit('tabUnsaved',true)  //track actual changes    
    emit('tabUnsaved',!cond?true:false)  //track actual changes
  }, { deep: true, immediate: false })

  function handleSelected(cs,val){
    switch(cs){
      case 'left':
        disabled.value[0]=val?false:true
        if(val) state.value[1].map((item) => {
          return item.selected=false
        })
        break
      case 'right':
        disabled.value[1]=val?false:true
        if(val) state.value[0].map((item) => {
          return item.selected=false
        })
    }
  }
  function handleClick(cs){
    const from=cs==='left'?0:1
    const to=cs==='left'?1:0       
    const idx=state.value[from].findIndex((row) => {
      return row.selected
    })
    const obj={}
    if(props.idRole) obj.idRole=props.idRole
    if(props.entity==='ExpoDoc') obj.idType=cs==='left'?1:null
    state.value[to].push({...state.value[from][idx],ID:null,idExpo:props.idExpo,...obj})
    state.value[from]=_.filter(state.value[from],(row,i) => {
      return !row.selected
    })
    initSelected()
    disabled.value=[true,true,disabled.value[2]]
  }
  //File viewer modal
  const file=ref(null)
  const isOpen = ref(false)
  function openModal(row) {
    if(props.entity!=='ExpoDoc' || !row.selected) return
    file.value={url:row.url,name:row.fileName,ext:getFileExtension(row.fileName)}
    isOpen.value = true
  }
  function closeModal() {
    isOpen.value = false
  }

</script>

<template>
  <FileViewerModal 
    v-if="isOpen"
    :file="file"
    @close-modal="closeModal"
  >
  </FileViewerModal> 
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
          :rowKey="relatedFields[0]"
          @selected="(val) => {
            handleSelected('left',val)
          }"
        >
          <template #body="slotProps">
            <q-td :class="entity==='ExpoDoc' && slotProps.row.selected?'pointer':''" @click="openModal(slotProps.row)">
              <span>{{ slotProps.row[visible[1]] }}
                <Tooltip v-if="entity==='ExpoDoc' && slotProps.row.selected" :tt_text=" $t('comps.form_details.expos.tables.doc-tip')"></Tooltip>  
              </span>     
            </q-td>                 
            <q-td v-if="slotProps.row[visible[2]] && visible[2]!=='url'">
              {{ slotProps.row[visible[2]] }}
            </q-td>
            <q-td>
              <img v-if="slotProps.row.url && visible.includes('url')" :src="slotProps.row.url" :alt="slotProps.row[visible[1]]" loading="lazy">
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
          :rowKey="relatedFields[0]"
          @selected="(val) => {
            handleSelected('right',val)
          }"
        >
          <template #body="slotProps">
            <q-td :class="entity==='ExpoDoc' && slotProps.row.selected?'pointer':''" @click="openModal(slotProps.row)">
              <span>{{ slotProps.row[visible[1]] }}
                <Tooltip v-if="entity==='ExpoDoc' && slotProps.row.selected" :tt_text=" $t('comps.form_details.expos.tables.doc-tip')"></Tooltip>  
              </span>     
            </q-td> 
            <q-td v-if="slotProps.row[visible[2]] && visible[2]!=='url'">
              {{ slotProps.row[visible[2]] }}
            </q-td>
            <q-td>
              <img v-if="slotProps.row.url && visible.includes('url')" :src="slotProps.row.url" :alt="slotProps.row[visible[1]]" loading="lazy">
            </q-td>
            <q-td v-if="entity==='ExpoDoc' || (entity==='UserExpoRole' && idRole===4)">
              <q-select
                filled
                v-model="slotProps.row[`${idRole===4?'idRole':'idType'}`]"
                :options="state[2]"
                :option-value="`${idRole===4?'idRole':'idType'}`"
                :option-label="`${idRole===4?'role':'type'}_${locale}`"
                :disable="!slotProps.row.selected"
                emit-value
                map-options
                dense
              >
              </q-select>
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
        @button-action="
          async () => {
            initialValues=await handleSaveMaster(state[1], initialValues,entity,token,inFlight)
            disabled[2] = true
            emit('tabUnsaved', false)
          }"     
      >
      </FieldsetButton>
    </div>
  </div>
</template>

<style scoped>
  td, tr {
    max-height:2rem;
  }
  td.pointer {
    cursor: pointer;
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
    padding-top:20px;
  }

</style>