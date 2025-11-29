<script setup>
  import {ref,useAttrs} from 'vue';

  const props=defineProps({
    title:{type:String},
    data:{type:Array},
    columns:{type:Array},
    visible:{type:Array},
    rowKey:{type:String}
  })
  const attrs = useAttrs() // allow passing any extra QTable props from parent
  const emit=defineEmits(['selected'])

  const rows=ref(props.data)

  function handleSelection(val,id){
    if(val){
      rows.value.map((row) => {
        if(row[props.rowKey]!==id) row.selected=false
      })
    }
    emit('selected',val)
  }

</script>

<template>
  <q-table 
    class="table"
    :title="title"
    :rows="rows"
    :columns="columns"
    :visible-columns="visible"
    :row-key="rowKey"
    virtual-scroll      
    dense
    v-bind="attrs"
  >
    <template #top>
      <slot name="top" ></slot>
    </template>
    <template v-slot:body="slotProps">
      <q-tr>
        <q-td :class="['checkbox',slotProps.rowIndex===rows.length-1?'last':'']">  
          <div class="row-header">       
            <q-checkbox 
              v-model="slotProps.row.selected" 
              size="sm"
              dense 
              @update:model-value="(val) => {
                handleSelection(val,slotProps.key)
              }"
            >       
            </q-checkbox> 
            <slot name='artist' v-bind="slotProps"></slot>
          </div> 
          <slot name='infos' v-bind="slotProps"></slot>
          <slot name='actions' v-bind="slotProps"></slot>
        </q-td>
        <slot name="body" v-bind="slotProps"></slot>
      </q-tr>
    </template>
  </q-table>

</template>

<style scoped>
  div.q-table__container {
    width:100%;
    height: fit-content;
    border:2px solid  var(--blue);
  }
  ::v-deep(.q-table__title) {
    font-size: 1.5rem;
    font-weight: 500;
    font-style: italic;
    padding-top:5px;
    color: #2c3e50;
  }
  ::v-deep(.q-table thead) {
    display:none;
  }
  ::v-deep(.q-table th.col-name) {
    width: 300px;
    text-align: left;
  }
  ::v-deep(.q-table tr td) {  
    font-size: 1.5rem;
  }
  div.row-header {
    display:flex;
    flex-wrap: nowrap;
    align-items:self-start;
  }
  div.row-header .q-checkbox {
    margin-top:10px;
    padding:0 5px;
  }
  td.q-td.checkbox {    
    padding-left:5px;
    border-right:1px solid  var(--blue);
  }
   .q-td.checkbox.last {  
    border-bottom: 1px solid var(--blue); 
  }
  
</style>