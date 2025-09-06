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

  const emit=defineEmits(['change'])
  function handleChange(name,valid,val){
    emit('change',name,valid,val)
  }

</script>

<template>
  <address>
    <InputField 
      v-for="(item) in fields" 
      :key="item.name"
      :name="item.name"
      :field_type="item.field_type"
      :label="item[`label_${locale}`]"
      :required="item.required"
      :disabled="item.disabled"
      :highlight="item.highlight"
      :format="item.format"
      :value="data[item.name]?data[item.name]:''"
      :rows="item.rows"
      @change="handleChange"
    >    
    </InputField>
  </address>
</template>

<style scoped>
  address {
    display:flex;
    flex-wrap: wrap;
    gap:10px;
  }

</style>