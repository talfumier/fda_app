<script setup>
  import {defineEmits} from 'vue';
  import FieldsetStandard from './FieldsetStandard.vue';
  import FieldsetAddress from './FieldsetAddress.vue';
  import FieldsetTranslate from './FieldsetTranslate.vue';
  import FieldsetButton from './FieldsetButton.vue';

  const props=defineProps({
    entity:{type:Object},
    fieldsets:{type:Array},
    record:{type:Object}
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
    <fieldset :class="item.type" v-for="(item,idx) in fieldsets">
      <FieldsetStandard
        v-if="item.type==='standard'"
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
    padding:0 5px;
  }
  fieldset:has(.button) {
    justify-content:center;
  }
</style>