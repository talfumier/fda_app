<script setup>
  import { computed,defineEmits } from 'vue';
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

</script>

<template>
  <InputField 
    v-for="(item,idx) in filteredFields" 
    :key="item.name"
    :name="item.name"
    :field_type="item.type"
    :label="item[`label_${locale}`]"
    :disabled="item.disabled"
    :format="item.format"
    :value="data[item.name]?data[item.name]:''"
    :rows="item.rows"
    @change="handleChange"
  >    
  </InputField>
</template>

<style scoped>

</style>