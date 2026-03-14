<script setup>
  import {ref,watch,inject,onMounted,onUnmounted} from 'vue'
  import _ from 'lodash'
  import { getEntitiesBySql } from '@/services/httpEntities.js'
  import { newController,doneController,cancelAllInFlight } from '@/utilityFunctions.js'
  import GenericTable from './GenericTable.vue'
  import FieldsetButton from '../../FieldsetButton.vue'
  import { isEqual,handleSaveAward } from './expoFunctions.js'

  const props=defineProps({
    entity:{type:String},
    idExpo:{type:Number},
    relatedFields:{type:Array},
    sql:{type:String},
    columns:{type:Array},
    visible:{type:Array},
  })

  const {token}=inject('userCookie')
  const inFlight=new Set()

  const state=ref([])
  let initialValues=null
  const disabled=ref(true)

  const emit=defineEmits(['tabUnsaved'])

  watch(() => {
    if(state.value.length>0) return state.value[0]
  }, (newValue, oldValue) => {
    const cond=isEqual(_.cloneDeep(state.value[0]),initialValues)  
    disabled.value=cond //bottom action button disabled condition
    // if(!cond) emit('tabUnsaved',true)  //track actual changes
    emit('tabUnsaved',!cond?true:false)  //track actual changes
  }, { deep: true, immediate: false })

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
    state.value[0].map((row,idx) => {
      return state.value[0][idx]={...row,selected:false}
    })
  }
  onMounted(async () => {  
    const ctrl=newController(inFlight)
    try {
      state.value = await fetch(ctrl.signal) 
      initialValues=_.cloneDeep(state.value[0])   //selected property not in initialValues
      initSelected()
      state.value[1].splice(0,0,{idUser:null,artist:null,url:null}) //adding null value in select options
    } catch (error) {
      console.error('onmounted failed in ExpoAward.vue', error)
      return
    }
    finally {
      doneController(ctrl,inFlight)
    }
  })
  onUnmounted(() => { // clean-up code after component has unmounted  
    cancelAllInFlight(inFlight)
  })

  function handleChange(cs,val,idx){
    switch(cs){
      case 'toggle':
        if(val===0) state.value[0][idx].idUser=null
    }
  }

</script>

<template>
  <div class="container">
    <GenericTable v-if="state.length>0"
      class='award'
      title=''
      :data="state[0]"
      :columns="columns"
      :visible="visible"
      rowKey='idPrize'
    >
      <template #body="slotProps">
        <q-td :class="!slotProps.row.applicable?'line-through':''">
          {{ slotProps.row[visible[1]] }}
        </q-td>
        <q-td>
          <q-toggle
            v-model="slotProps.row.applicable" 
            :true-value="1" :false-value="0"
            :label="slotProps.row.applicable?$t('comps.form_details.expos.tables.award.toggle.yes'):$t('comps.form_details.expos.tables.award.toggle.no')"
            :color="slotProps.row.applicable?'positive':'deep-orange-9'"
            keep-color
            checked-icon="check"
            unchecked-icon="clear"
            size="md"
            :disable="!slotProps.row.selected"
            @update:model-value="(val) => {
              handleChange('toggle',val,slotProps.rowIndex)
            }"
          /> 
        </q-td>
        <q-td>
          <q-select
            filled
            v-model="slotProps.row.idUser"
            :label="slotProps.row.applicable && slotProps.row.selected && !slotProps.row.idUser?$t('comps.form_details.expos.tables.award.select.winner'):''"
            :options="state[1]"
            option-value='idUser'
            option-label='artist'
            :disable="!slotProps.row.applicable || !slotProps.row.selected"
            emit-value
            map-options
            dense
            @update:model-value="(val) => {
              if(val!==null) slotProps.row.idUser=parseInt(val)
            }"
          >
            <template v-slot:option="slotProps">
              <q-item v-bind="slotProps.itemProps" dense>                
                <div class="option">
                  <q-img :src="slotProps.opt && slotProps.opt.url" />
                  <span>{{ slotProps.opt.artist }}</span>
                </div>
              </q-item>
            </template>
            <template v-slot:selected-item="slotProps">
              <div class='selected'>
                <q-img :src="slotProps.opt.url"/>
                <span>{{ slotProps.opt.artist }}</span>
              </div>
            </template>
          </q-select>
        </q-td>
      </template>
    </GenericTable>
  </div> 
  <div class="bottom-container">
    <FieldsetButton  
      :buttons="[{
          name: 'save',
          icon:'save',
          label_fr: 'Enregistrer',
          label_en: 'Save'
        }]"  
        :disabled="{save:disabled}"        
        @button-action="async () => {
          await handleSaveAward(state[0], initialValues, idExpo, relatedFields, entity, token, inFlight)  
          disabled = true
          emit('tabUnsaved', false)
        }"                
    >
    </FieldsetButton>
  </div>
</template>
<style scoped>
  div.container {
    display:flex;
    justify-content:center;
    margin-top:50px;
    /* padding: 0 20px 10px 20px; */
  }
  td.line-through {
    text-decoration: line-through;
  }
  .q-select {
    width:250px;
  }
  .q-img {
    object-fit: cover;
    width:30px;
    height:30px;
  }
  div.option,div.selected {
    display:flex;
    flex-wrap: nowrap;
    justify-content: left;
    gap:5px;
    align-items: center;
  }
  ::v-deep(.q-field__control-container.col.relative-position.row) {
    padding:0;
  }
  div.bottom-container {
    display: flex;
    justify-content: center;
    padding-top:20px;
  }
</style>