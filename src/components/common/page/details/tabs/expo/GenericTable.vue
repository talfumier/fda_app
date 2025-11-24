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
    <template v-slot:body="slotProps">
      <q-tr>
        <q-td>
          <q-checkbox 
            v-model="slotProps.row.selected" 
            size="sm"
            dense 
            @update:model-value="(val) => {
              handleSelection(val,slotProps.key)
            }"
          >       
          </q-checkbox> 
        </q-td>
        <slot name="body" v-bind="slotProps"></slot>
      </q-tr>
    </template>
  </q-table>

</template>

<style scoped>
  ::v-deep(.q-table__title) {
    font-size: 1.5rem;
    font-weight: 500;
    font-style: italic;
    padding-top:5px;
    color: #2c3e50;
  }
  ::v-deep(.q-table th.col-name) {
    width: 300px;
    text-align: left;
  }
  ::v-deep(.q-table tr td) {    
    font-size: 1.5rem;
  }
  div.q-table__container {
    width: 400px;
    height:250px;
  }
  div.q-table__container.award {
    width: 100%;
    height:280px;
  }
</style>