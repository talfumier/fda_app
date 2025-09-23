<script setup>
  import { computed } from 'vue';
  import _ from 'lodash'
  import { useI18n } from 'vue-i18n';
  import InputField from '../../fields/InputField.vue';

  const props = defineProps({
    fields:{type:Array},
    data:{type:Object}
  })  
  const {locale}=useI18n()
  //filter out _fr or _en fields when they are optional AND do not match the current locale
  const filteredFields=computed(() => {
    return _.filter(props.fields,(fld) => {
      if(fld.optional) return fld.name.slice(-2)===locale.value
      else return true      
    })
  })
  const emit=defineEmits(['change'])
  function handleChange(name,valid,val){
    emit('change',name,valid,val)
  }
  function handleIconClick(cs,url){
    switch (cs){
      case "url":
        window.open(url, '_blank') 
    }
  }
// :value="data[item.name]!==null?data[item.name]:''"
</script>

<template>
  <InputField 
    v-for="(item) in filteredFields" 
    :key="item.name"
    :name="item.name"
    :field_type="item.field_type"
    :data_type="item.data_type"
    :icon="item.icon"
    :placeholder="item.placeholder"
    :label="item[`label_${locale}`]"
    :required="item.required"
    :disabled="item.disabled"
    :highlight="item.highlight"
    :format="item.format"
    :value="data[item.name]"
    :rows="item.rows"
    :options="item.options"
    @change="handleChange"
    @icon-click="handleIconClick(item.data_type,data[item.name])"
  >    
  </InputField>
</template>

<style scoped>

</style>