<script setup>
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import _ from 'lodash'  
  import { useFormatDate } from '@/composable/useFormatDate.js'

  const props=defineProps({
    id:{type:Number},
    item:{type:Object},
    master:{type:Array},
    rowSchema:{type:Array}
  })

  const {locale}=useI18n()  
  const {formatDateTime}=useFormatDate()
  const filteredMaster=computed(() => {
    return _.filter(props.master,(mstr) => {
      if(mstr.name.endsWith('_fr') || mstr.name.endsWith('_en')) return mstr.name.endsWith(locale.value)
      return true
    })
  })
  const len=computed(() => {
    return filteredMaster.value.length
  })
  const status=computed(() => {
    if(!props.item.idStatus) return [1,'warning'] 
    switch (props.item.idStatus){
        case 1:
        case 7:
        case 8:
        case 11:
          return [1,'warning']
        case 2:
        case 10:
        case 12:
          return [2,'positive']
        case 3:
        case 9:
        case 13:
          return [3,'negative']
        default:
          return []
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
  function setRowText(row){
    let n=0
    switch(row){
      case '1.1':
        n=0 
        break
      case '1.2':
        n=1
        break
      case '2.1':
        n=len.value-1
    }
    const field=filteredMaster.value[n]
    if(len.value>=1 && props.item[field.name]) return field.format==='date-time'?formatDateTime(props.item[field.name]):props.item[field.name]
    return ''
  }

</script>

<template>
  <label :for="id">
    <div v-if="rowSchema.includes('1.1')" class="row1">
      <span :class="setUCase(filteredMaster[0].name)?'ucase':''">
        {{setRowText('1.1')}}
      </span>
      <span 
        v-if="rowSchema.includes('1.2')" 
        class="ccase">{{setRowText('1.2')}}
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
    <div v-if="rowSchema.includes('2.1')" :class="['row2', setLCase(filteredMaster[len-1]?filteredMaster[len-1].name:'')]">
      <span>{{ setRowText('2.1') }}</span>
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
  .group .row1 {
    margin-top: 5px;
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