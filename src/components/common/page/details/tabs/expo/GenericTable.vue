<script setup>
  import {computed,useAttrs} from 'vue';

  const props=defineProps({
    title:{type:String},
    data:{type:Array},
    columns:{type:Array},
    visible:{type:Array},
    rowKey:{type:String}
  })
  const attrs = useAttrs() // allow passing any extra QTable props from parent
  const emit=defineEmits(['selected'])

  const rows = computed(() => props.data)

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
    :rows-per-page-options="[0]"
    :pagination="{ rowsPerPage: 0 }"
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
    /* width: 200px; */
    text-align: left;
  }
  ::v-deep(.q-table tr td) {    
    font-size: 1.5rem;
    padding:0 5px;
  }
  div.q-table__container {
    width: 300px;
    height:250px;
  }
  div.q-table__container.award {
    width: 100%;
    height:280px;
  }
  @media screen and (min-width: 500px) {
    ::v-deep(.q-table th.col-name) {
      width: 300px;
    }
    div.q-table__container {
      width: 480px;
    }
  }
</style>