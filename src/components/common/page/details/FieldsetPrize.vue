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

  const rows=ref(null) 
  watch(props.data, (newValue, oldValue) => {
    rows.value=_.cloneDeep(_.orderBy(newValue,['order']))
    rows.value.map((row) => {  //set selected to false
      row.selected=false
    })
  }, { deep: true, immediate: true })

  const columns=[
    {name:'selected',field:'selected',align:'left'},
    {name:'idPrize',field:'idPrize',align:'left'},
    {name:'prize_fr',field:'prize_fr',headerClasses: 'col-name'},
    {name:'prize_en',field:'prize_en',headerClasses: 'col-name'},
    {name:'order',field:'order',align:'left'}
  ]
  const visible=['idPrize','prize_fr','prize_en','order']

  let newRowId=0
 
  const pagination = { rowsPerPage: 0 }

  const emit=defineEmits(['change','deleteRow'])

  function handleSelection(selected,rowKey){
    if(selected){
      rows.value.map((item) => {
        if(item.idPrize!==rowKey) item.selected=false
      })
    }
  }
  function handleChange(){
    const val=_.cloneDeep(rows.value).map((item) => {
        delete item.selected
        return item
      })
    emit(
      'change',
      'prize',
      true,
      val
    )
  }
  function findIndex(arr,id){
    return arr.findIndex((item) => {
      return item.idPrize===id
    }) 
  }  
  function initNewRow(){
    const row={}
    newRowId+=-1
    row.idPrize=newRowId
    row.prize_fr=''
    row.prize_en=''
    row.order=''
    row.selected=true
    return row
  }
  async function handleAction(cs,rowKey){
    switch(cs){
      case 'insert':
        rows.value.splice(findIndex(rows.value,rowKey),0,initNewRow())
        handleChange()
        handleSelection(true,newRowId)
        break
      case 'delete':
        if(rowKey<0) //row not yet saved to database
          rows.value=_.filter(rows.value,(row) => {
            return row.idPrize!==rowKey
          })
        else {
          if (!(await confirm($q,t('common.confirm.delete-row'),'cancel'))) return 
          emit('deleteRow','Prize',rowKey)
        }
    }
  }

</script>

<template>
  <div class="table-container admin">    
    <q-table
      class="table sticky-header"
      :rows="rows"
      :columns="columns"
      :visible-columns="visible"
      :row-key="columns[0].name"
      virtual-scroll
      v-model:pagination="pagination"
      :rows-per-page-options="[0]"
      hide-pagination
      dense
    >
      <template #header="slotProps">
        <q-tr :props="slotProps">
          <q-th auto-width />  <!-- checkbox column -->
          <q-th v-for="col in slotProps.cols" :key="col.name" :props="slotProps">
            {{ col.name }}
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
                handleSelection(slotProps.row.selected,slotProps.row.idPrize)
              }"
            >       
            </q-checkbox> 
          </q-td>  
          <!-- <div>{{slotProps.cols}}</div> -->
          <q-td v-for="(field,i) in slotProps.cols" :key="field">
            <q-input 
              v-model="slotProps.row[field.name]"
              type="text"
              :borderless="!slotProps.row.selected"
              dense
              :readonly="!slotProps.row.selected || i===0"
              :style="`width: ${i===0 || i===3?30:150}px`"
              @change="(val) => {
                handleChange()
              }"
            />
          </q-td>
          <q-td>
            <div v-if="slotProps.row.selected" class="buttons">
              <q-btn round flat icon="add_circle" size="1.2rem" color="primary"
                @click="handleAction('insert',slotProps.key)"
              >
                <Tooltip :tt_text="$t('common.insert-row')"></Tooltip>
              </q-btn>
              <q-btn round flat icon="delete" size="1.2rem" color="negative"
                @click="handleAction('delete',slotProps.key)"
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
  div.table-container {
    display:flex;
    flex-wrap: wrap;
    justify-content: space-evenly;
    align-items: center;
    width:100%;
  }
  .table {
    max-height: 200px;
    overflow:auto;
    padding-bottom: 10px;
    margin-bottom: 5px;
  }
  .sticky-header thead th {
    position: sticky;
    top: 0px;       
    height:35px;
    z-index: 1000;
    font-size: 1.5rem;
    background: var(--grey-light);  
  }
  ::v-deep(.q-table th.col-name) {
    width: 200px;
    text-align: left;
  }
  div.buttons {
    display:flex;
    justify-content: between;
    gap:5px;
  }
 
</style>