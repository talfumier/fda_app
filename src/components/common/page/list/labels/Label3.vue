<script setup>
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import _ from 'lodash'

  const props=defineProps({
    item:{type:Object},
    master:{type:Array},
    id:{type:Number}
  })
  const {locale}=useI18n()
  const filteredMaster=computed(() => {
    return _.filter(props.master,(mstr) => {
      if(mstr.name.endsWith('_fr') || mstr.name.endsWith('_en')) return mstr.name.endsWith(locale.value)
      return true
    })
  })
  const status=computed(() => {
   switch (props.item.idStatus){
      case 1:
      case 10:
        return [1,'warning']
      case 2:
      case 11:
        return [2,'positive']
      case 3:
      case 12:
        return [3,'negative']
    }
 }) 

</script>

<template>
  <label  :for="id">
    <div class="row1">
      <span class="ucase">{{item[filteredMaster[0].name]?item[filteredMaster[0].name]:filteredMaster[0].default}}</span>
      <span v-if="filteredMaster[1]" class="ccase">{{ item[filteredMaster[1].name]?item[filteredMaster[1]?.name]:filteredMaster[1].default }}</span>
      <q-icon v-if="status[0]===1 || status[0]===2" name="done_all" :color="status[1]" size="2.5rem"></q-icon>
      <q-icon v-if="status[0]===3" name="no_accounts" :color="status[1]" size="2.5rem"></q-icon>
    </div>
    <div v-if="filteredMaster[2]" class="row2 lcase">
      <span>{{ item[filteredMaster[2].name] }}</span>
    </div>
  </label>
</template>

<style scoped>
  label {
    cursor: pointer;
  }  
  span {
    padding-right: 5px;
  }
  .row1 {
    display:flex;
    flex-wrap: nowrap;
    justify-content: left;
    position:relative;
    min-width:250px;
  }
  .q-icon {
    position:absolute;
    right:0;
  }
  .ucase {
    text-transform: uppercase;
  }
  .ccase {
    text-transform: capitalize;
  }
  .lcase {
    text-transform: lowercase;
  }
  .row2 {
    display:flex;
    justify-content: left;
  }
  .row2 span {
    font-weight: lighter;
    color:blue;
    padding:0 5px;
  }

</style>