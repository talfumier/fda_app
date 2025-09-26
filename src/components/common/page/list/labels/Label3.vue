<script setup>
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import _ from 'lodash'

  const props=defineProps({
    id:{type:Number},
    item:{type:Object},
    master:{type:Array},
    rows:{type:Array,default:[1,2]}
  })
  const {locale}=useI18n()
  const filteredMaster=computed(() => {
    return _.filter(props.master,(mstr) => {
      if(mstr.name.endsWith('_fr') || mstr.name.endsWith('_en')) return mstr.name.endsWith(locale.value)
      return true
    })
  })
  const status=computed(() => {
    if(props.item.idBookingOeuvre===undefined) return []  //temporary pending implementation of booking_oeuvre status
    if(!props.item.idStatus) return [1,'warning'] 
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

  function setUCase(name){  //1st label case setting in row1
    switch(name){
      case 'lastName':
        return true
      default:
        return false
    }
  }
  function setLCase(name){  //label case setting in row2
    switch(name){
      case 'title_fr':
      case 'title_en':
        return false
      default:
        return true
    }
  }

</script>

<template>
  <label  :for="id">
    <div v-if="rows.includes(1) && filteredMaster.length>=1" class="row1">
      <span :class="setUCase(filteredMaster[0].name)?'ucase':''">
        {{item[filteredMaster[0].name]?item[filteredMaster[0].name]:filteredMaster[0].default}}
      </span>
      <span 
        v-if="filteredMaster[1]" 
        class="ccase">{{ (item[filteredMaster[1].name]?item[filteredMaster[1]?.name]:filteredMaster[1].default).toLowerCase() }}
      </span>
      <q-icon 
        v-if="status && (status[0]===1 || status[0]===2)" 
        name="done_all" :color="status[1]" size="2.5rem">
      </q-icon>
      <q-icon 
        v-if="status && status[0]===3" 
        name="no_accounts" :color="status[1]" size="2.5rem">
      </q-icon>
    </div>
    <div v-if="rows.includes(2) && filteredMaster[2]" :class="['row2', setLCase(filteredMaster[2].name)]">
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
    text-transform:capitalize;
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