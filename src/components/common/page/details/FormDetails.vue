<script setup>
  import {computed} from 'vue'
  import { useI18n } from 'vue-i18n'
  import _ from 'lodash'
  import FieldsetStandard from './FieldsetStandard.vue'
  import FieldsetAddress from './FieldsetAddress.vue'
  import FieldsetTranslate from './FieldsetTranslate.vue'
  import FieldsetButton from './FieldsetButton.vue'
  import DialogInfo from '../../DialogInfo.vue'
  import FieldsetFile from './FieldsetFile.vue'
  import FieldsetFiles from './FieldsetFiles.vue'
  import { getRandomInt } from '@/utilityFunctions.js'

  const props=defineProps({
    entity:{type:Object},
    fieldsets:{type:Array},
    record:{type:Object}
  })
  const {locale}=useI18n()
  const filteredFieldsets=computed(() => {
    return _.filter(props.fieldsets,(item) => {
      if(item.type==='button-bottom' || !props.record) return false
      else return item.roles?item.roles.includes(props.record.idRole):true
    })
  })
  const emit=defineEmits(['change','translate','buttonAction'])
  function handleChange(id,name,valid,val){    
    emit('change',id,name,valid,val)
  }
  function handleTranslate(id,params) {
    emit('translate',id,params)
  }
  function handleButtonAction(name){
    emit('buttonAction',name)
  }

</script>

<template>
    <slot name="toolbar"></slot>
    <fieldset :class="[item.type,item.name]" v-for="(item,idx) in filteredFieldsets" >
      <legend>
          {{ item[`legend_${locale}`] }}<DialogInfo v-if="item.info" :path="item.info_path"></DialogInfo>
      </legend>
      <FieldsetStandard
        v-if="item.type.includes('standard')"
        :key="idx"
        :fields="item.fields"
        :data="record"
        @change="(name,valid,val) => {
          handleChange(record[`id${entity.model}`],name,valid,val)
        }"
      >
      </FieldsetStandard>    
      <FieldsetAddress
        v-if="item.type==='address'"
        :key="idx"
        :fields="item.fields"
        :data="record"
        @change="(name,valid,val) => {
          handleChange(record[`id${entity.model}`],name,valid,val)
        }"
      >
      </FieldsetAddress>      
      <FieldsetTranslate
        v-if="item.type==='translate'"
        :key="idx"
        :fields="item.fields"
        :data="record"
        @change="(name,valid,val) => {
          handleChange(record[`id${entity.model}`],name,valid,val)
        }"
        @translate="(params) => {
          handleTranslate(record[`id${entity.model}`],params)
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
      <FieldsetButton  
        v-if="item.type==='button'"
        :key="idx"
        :buttons="item.buttons"  
        @button-action="handleButtonAction"      
      >
      </FieldsetButton>
    </fieldset>
</template>

<style scoped>
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
  fieldset:has(.button) {
    justify-content:center;
    align-items: top;
    border-width: 0;
    padding:10px 0;
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
</style>