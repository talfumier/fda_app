<script setup>
  import {ref,watch,computed} from 'vue'
  import { useQuasar } from 'quasar'
  import { useI18n } from 'vue-i18n'
  import _ from 'lodash'
  import FieldsetStandard from './FieldsetStandard.vue'
  import FieldsetAddress from './FieldsetAddress.vue'
  import FieldsetTranslate from './FieldsetTranslate.vue'
  import FieldsetButton from './FieldsetButton.vue'
  import DialogInfo from '../../DialogInfo.vue'
  import FieldsetFile from './FieldsetFile.vue'
  import FieldsetFiles from './FieldsetFiles.vue'
  import FieldsetBookingOeuvre from './FieldsetBookingOeuvre.vue'
  import FieldsetDomainTechMedia from './FieldsetDomainTechMedia.vue'
  import ExpoPartner from '@/components/expo/ExpoPartner.vue'
  import { getRandomInt } from '@/utilityFunctions.js'
  import { confirm } from '../../dialog/dialog.js'

  const props=defineProps({
    entity:{type:Object},
    fieldsets:{type:Array},
    record:{type:Object}
  }) 
    
  const {t,locale}=useI18n()  
  const $q=useQuasar()

  const tabUnsaved=ref(false)
  const _tab=ref('default')
  const tab = computed({
    get: () => _tab.value,
    set: async(val) => {
      if (tabUnsaved.value && !(await confirm($q,t('common.unsaved'),'cancel'))) return 
      _tab.value = val
      tabUnsaved.value=false
    }
  })
  const filteredFieldsets=computed(() => {
    return _.filter(props.fieldsets,(item) => {
      if(item.type==='button-bottom' || !props.record) return false
      else return item.roles?item.roles.includes(props.record.idRole):true
    })
  })
  const emit=defineEmits(['hideToolbar','change','translate','buttonAction','deleteRow','tabUnsaved'])
  watch(    //watch tab value to hide main toolbar when active tab is no longer on default
    () => tab.value,              // <-- getter function required for primitive value
    (v) => { 
      emit('hideToolbar',v==='default'?false:true) 
    },
    { immediate: false }
  )
  function handleChange(name,valid,val,option){ 
    emit('change',name,valid,val,option)
  }
  function handleTranslate(params) {
    emit('translate',params)
  }
  function handleFileChange(file){
    Object.keys(file).map((key) => {
      handleChange(key,true,file[key])
    })
  }
  function handleButtonAction(name){
    emit('buttonAction',name)
    }
  function getUniqueKey(){
    let x=null
    Object.keys(props.record).map((key) => {
      if(key.includes('id')) x+=props.record[key]
    })
    return x
  }
</script>

<template>
    <slot name="toolbar"></slot>
    <q-card v-if="entity.detailsTabs">
      <q-tabs
        v-model="tab"
        dense
        class='text-grey'
        active-color='primary'
        indicator-color='primary'
        narrow-indicator
      >
        <q-tab v-for="(item) in entity.detailsTabs" :name="item.name" :label="$t(item.label)" />
      </q-tabs>
    </q-card>
    <q-tab-panels v-model="tab" :class="entity.detailsTabs?'offset':''" animated>
      <q-tab-panel name='default' >
        <fieldset :class="[item.type,item.name]" v-for="(item,idx) in filteredFieldsets" >
          <legend > 
              {{ item[`legend_${locale}`] }}<DialogInfo v-if="item.info" :path="item.info_path"></DialogInfo>
          </legend>
          <FieldsetStandard
            v-if="item.type==='standard'"
            :key="getUniqueKey()"
            :fields="item.fields"
            :data="record"
            @change="handleChange"
          >
          </FieldsetStandard>    
          <FieldsetAddress
            v-if="item.type==='address'"
            :key="idx"
            :fields="item.fields"
            :data="record"
            @change="(name,valid,val) => {
              handleChange(name,valid,val)
            }"
          >
          </FieldsetAddress>      
          <FieldsetTranslate
            v-if="item.type==='translate'"
            :key="idx"
            :fields="item.fields"
            :data="record"
            @change="(name,valid,val) => {
              handleChange(name,valid,val)
            }"
            @translate="(params) => {
              handleTranslate(params)
            }"
          >
          </FieldsetTranslate>
          <FieldsetFile
            v-if="item.type==='single-upload'"          
            :key="getRandomInt(100,3e3)"
            :fileYes="entity.fileYes"
            :model="entity.model"
            :fields="item.fields"
            :data="record"
            @file-change="(file) => {
              handleFileChange(file)
            }"
          >
          </FieldsetFile>
          <FieldsetFiles
            v-if="item.type==='multiple-upload'"          
            :key="getRandomInt(1e3,3e5)"
            :fileYes="entity.fileYes"
            :model="entity.model"
            :fields="item.fields"
            :count="item.count"
            :data="record"
          >
          </FieldsetFiles>
          <FieldsetDomainTechMedia
            v-if="item.type==='domain-tech-media'"
            :data="[record.domain,record.tech,record.media]"
            @change="handleChange"
            @delete-row="(model,id) => {
              emit('deleteRow',model,id)
            }"
          >
          </FieldsetDomainTechMedia>
          <FieldsetBookingOeuvre
            v-if="item.type==='booking-oeuvre'"  
            :data="record"
            @change="(name,valid,val) => {
              handleChange(name,valid,val)
            }"
          >
          </FieldsetBookingOeuvre>
          <FieldsetButton  
            v-if="item.type==='button'"
            :buttons="item.buttons"  
            @button-action="handleButtonAction"      
          >
          </FieldsetButton>
        </fieldset>
      </q-tab-panel>
      <q-tab-panel v-if="entity.model==='Expo'" name='guest' >
          <div>GUEST</div>
      </q-tab-panel>
      <q-tab-panel v-if="entity.model==='Expo'" name='jury' >
          <div>JURY</div>
      </q-tab-panel>
      <q-tab-panel v-if="entity.model==='Expo'" name='partner' >
          <ExpoPartner
            :idExpo="record.idExpo"
            @tab-unsaved="(val) => {
              tabUnsaved=val
              emit('tabUnsaved',val)
            }"
          >
          </ExpoPartner>
      </q-tab-panel>
    </q-tab-panels>
</template>

<style scoped>
  .q-card {
    position:absolute;
    top:0;
    z-index:1000;
    width:500px;
  }
  .q-tab-panels {
    padding:0 10px 20px;
  }
  .q-tab-panel {
    padding:0px 5px;
    height:100%;
    overflow-y: auto;
  }
  .q-tab-panels.offset .q-tab-panel {
    padding-top:40px;
  }
  fieldset {
    display:flex;
    flex-wrap: wrap;
    gap:10px;
    margin-top:5px;
    padding:0 10px 5px;
    border-radius: 5px;    
    border-color:rgb(154, 154, 238);
    border-width: 1px;
  }
  fieldset.public {
    justify-content: space-around;
  }
  fieldset.account {
    justify-content: space-around;
    align-items: center;
  }
  fieldset.links {
    justify-content: space-around;
  }
  fieldset.domain_tech_media {
    gap:30px;
  }
  fieldset.price {
    gap:60px;
  }
  fieldset.events {
    flex-direction: column;
    gap:0px;
  }
  fieldset:has(.button) {
    justify-content:center;
    align-items: top;
    border-width: 0;
    padding:10px 0;
  }
  fieldset.unknown {
    display:none;
  }
  legend {
    font-size:1.7rem;
    line-height: 2.2rem;
    text-wrap: nowrap;
    font-style: italic;
    font-weight:400;
    color:var(--blue);
    padding:0 5px;
  }
  @media screen and (min-width: 1546px) {
    fieldset.events {
      flex-direction: row;      
    }
  } 
</style>