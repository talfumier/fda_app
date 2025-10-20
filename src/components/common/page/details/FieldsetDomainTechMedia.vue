<script setup>
  import {ref,computed,watch} from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useQuasar } from 'quasar'
  import _ from 'lodash'
  import Tooltip from '../../Tooltip.vue'
  import { confirm } from '../../dialog/dialog.js'

  const props=defineProps({
    data:{type:Array}
  })
  const {t}=useI18n()   
  const $q=useQuasar()

  const tblIndex={0:'domain',1:'tech',2:'media'}

  const rows=ref(null) 
  watch(props.data, (newValue, oldValue) => {
    rows.value=_.cloneDeep(newValue)
    rows.value.map((tbl) => {  //set selected to false on each tbl and each row
      tbl.map((row) => {
        row.selected=false
      })
    })
  }, { deep: true, immediate: true })
  
  const columns=computed(() => {
    const cols=[]
    let arr=null
    rows.value.map((item) => {
      arr=[]
      Object.keys(item[0]).map((key,i) => {
        arr.push({name:key,label:key,field:key,align:'left',sortable: key==='order'?true:false})
      })
      cols.push(arr)
    })
    return cols
  })
  const visible=computed(() => {
    const cols=[]
    let arr=null
    props.data.map((item) => {
      arr=[]
      Object.keys(item[0]).map((key,idx) => {
        // if(!key.includes('id')) arr.push(key)
        arr.push(key)
      })
      cols.push(arr)
    })
    return cols
  })  

  let newRowId=0
 
  const pagination = ref(rows.value.map(() => ({ rowsPerPage: 0 })))  // Per-table pagination

  const emit=defineEmits(['change','deleteRow'])

  function handleSelection(selected,rowKey,idx){
    if(selected){
      const idKey=`id${_.capitalize(tblIndex[idx])}` //idDomain, idTech, idMedia
      rows.value[idx].map((item) => {
        if(item[idKey]!==rowKey) item.selected=false
      })
    }
  }
  function handleChange(idx){
    const val=_.cloneDeep(rows.value[idx]).map((item) => {
        delete item.selected
        return item
      })
    emit(
      'change',
      tblIndex[idx],
      true,
      val
    )
  }
  function findIndex(arr,key,id){
    return arr.findIndex((item) => {
      return item[`id${_.capitalize(key)}`]===id
    }) 
  }  
  function initNewRow(idx){
    const row={}
    newRowId+=-1
    row[`id${_.capitalize(tblIndex[idx])}`]=newRowId
    row[`${tblIndex[idx]}_fr`]=''
    row[`${tblIndex[idx]}_en`]=''
    row.order=''
    row.selected=true
    return row
  }
  async function handleAction(cs,idx,rowKey){
    switch(cs){
      case 'insert':
        rows.value[idx].splice(findIndex(rows.value[idx],tblIndex[idx],rowKey),0,initNewRow(idx))
        handleChange(idx)
        handleSelection(true,newRowId,idx)
        break
      case 'delete':
        if(rowKey<0) //row not yet saved to database
          rows.value[idx]=_.filter(rows.value[idx],(row) => {
            return row[`id${_.capitalize(tblIndex[idx])}`]!==rowKey
          })
        else {
          if (!(await confirm($q,t('common.confirm.delete-row'),'cancel'))) return 
          emit('deleteRow',_.capitalize(tblIndex[idx]),rowKey)
        }

    }
  }

</script>

<template>
  <div class="tables-container">    
    <q-table v-for="(item,idx) in rows"
      :key="idx"
      class="table sticky-header"
      :rows="item"
      :columns="columns[idx]"
      :visible-columns="visible[idx]"
      :row-key="columns[idx][0].name"
      virtual-scroll
      v-model:pagination="pagination[idx]"
      :rows-per-page-options="[0]"
      hide-pagination
      dense
    >
      <template #header="slotProps">
        <q-tr :props="slotProps">
          <q-th auto-width />  <!-- checkbox column -->
          <q-th v-for="col in slotProps.cols" :key="col.name" :props="slotProps">
            {{ col.label }}
          </q-th>
          <q-th auto-width/>  <!-- actions column -->
        </q-tr>
      </template>
      <template v-slot:body="slotProps">
        <q-tr :props="slotProps">
          <q-td  auto-width ><!-- actions column v-model="slotProps.row.selected" -->
            <q-checkbox 
              v-model="slotProps.row.selected" 
              size="sm"
              dense 
              @update:model-value="() => {
                slotProps.row.selected=true
                handleSelection(slotProps.row.selected,slotProps.key,idx)
              }"
            >       
            </q-checkbox> 
          </q-td>  
          <q-td v-for="(field,i) in slotProps.cols" :key="field">
            <q-input 
              v-model="slotProps.row[field.name]"
              type="text"
              :borderless="!slotProps.row.selected"
              dense
              :readonly="!slotProps.row.selected"
              :style="`width: ${i===2?30:100}px`"
              @change="(val) => {
                handleChange(idx)
              }"
            />
          </q-td>
          <q-td>
            <div v-if="slotProps.row.selected" class="buttons">
              <q-btn round flat icon="add_circle" size="1.2rem" color="primary"
                @click="handleAction('insert',idx,slotProps.key)"
              >
                <Tooltip :tt_text="$t('common.insert-row')"></Tooltip>
              </q-btn>
              <q-btn round flat icon="delete" size="1.2rem" color="negative"
                @click="handleAction('delete',idx,slotProps.key)"
              >
                <Tooltip :tt_text="$t('common.delete-row')"></Tooltip>
              </q-btn>
            </div>

          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>

</template>

<style scoped>
  div.tables-container {
    display:flex;
    flex-wrap: wrap;
    justify-content: space-evenly;
    align-items: center;
    width:100%;
    padding-bottom: 15px;
  }
  .table {
    max-height: 250px;
    overflow:auto;
    padding-bottom: 20px;
    margin-bottom: 20px;
  }
  .sticky-header thead th {
    position: sticky;
    top: 0px;       
    height:35px;
    z-index: 1000;
    font-size: 1.5rem;
    background: var(--grey-light);  
  }
  div.buttons {
    display:flex;
    justify-content: between;
    gap:5px;
  }
 
</style>