<script setup>
  import {computed,useAttrs} from 'vue'

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
  <div class="scroll-container">
    <div class="scroll-table">
      <q-table 
        class="sticky-top sticky-bottom"
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
        <template #header>
          <slot name="header" ></slot>
        </template>
        <template v-slot:body="slotProps">
          <q-tr>
            <q-td :class="['checkbox',slotProps.rowIndex===0?'first':'']">  
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
    </div>
  </div>
</template>

<style scoped>
  
  div.scroll-table {
    max-height: 600px;       
    overflow-y: auto;
    border-radius: 5px;
    border:2px solid  var(--blue);
  }
  ::v-deep(.sticky-top .q-table__top) {
    position: sticky;
    top: 0;
    z-index: 1000;
    background: white;      
    border-bottom: 1px solid var(--blue); 
  }
  div.q-table__container {
    width:100%;
    height: fit-content;
  }
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
  .q-td.first {
    border-top: none;
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
  ::v-deep(.sticky-bottom .q-table__bottom) {
    position: sticky;
    bottom: 0;
    z-index: 20;
    background: white;
    border-top: 1px solid var(--blue);
  }
  
</style>