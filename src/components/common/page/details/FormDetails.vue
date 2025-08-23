<script setup>
  import { defineEmits } from 'vue';
  import FieldsetStandard from './FieldsetStandard.vue';

  const props=defineProps({
    entity:{type:Object},
    fieldsets:{type:Array},
    record:{type:Object}
  })
  const emit=defineEmits(['change'])
  function handleChange(id,name,valid,val){
    emit('change',id,name,valid,val)
  }

</script>

<template>
  <fieldset v-for="(item,idx) in fieldsets">
    <FieldsetStandard
      :key="idx"
      v-if="item.type==='standard'"
      :fields="item.fields"
      :data="record"
      @change="(name,valid,val) => {
        handleChange(record[`id${entity.name}`],name,valid,val)
      }"
    >
    </FieldsetStandard>
  </fieldset>
</template>

<style scoped>
</style>