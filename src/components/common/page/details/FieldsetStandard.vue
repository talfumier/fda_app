<script setup>
  import { defineEmits } from 'vue';
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
  <fieldset v-for="(item,idx) in fields">
    <InputField
      :key="idx"
      :name="item.name"
      :field_type="item.type"
      :label="item[`label_${locale}`]"
      :format="item.format"
      :value="data[item.name]?data[item.name]:''"
      :rows="item.rows"
      @change="handleChange"
    >    
    </InputField>
  </fieldset>
</template>

<style scoped>

</style>