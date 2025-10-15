<script setup>
  import {ref,computed} from 'vue'

  const props=defineProps({
    data:{type:Array}
  })

  const selected=ref([[],[],[]])
  
  const columns=computed(() => {
    const cols=[]
    let arr=null
    props.data.map((item) => {
      arr=[]
      Object.keys(item[0]).map((key) => {
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
      Object.keys(item[0]).map((key) => {
        arr.push(key)
      })
      cols.push(arr)
    })
    return cols
  })

  const pagination=ref({
        rowsPerPage: 0
      })
</script>

<template>
  <div class="tables-container">
    <q-table v-for="(item,idx) in data"
      class="table"
      :rows="item"
      :columns="columns[idx]"
      :visible-columns="visible[idx]"
      :row-key="item[columns[idx][0].name]"
      
      virtual-scroll
      v-model:pagination="pagination"
      :rows-per-page-options="[0]"
      hide-pagination
      dense
    >
      <template v-slot:body="slotProps">
        <q-tr :props="slotProps">
          <q-td v-for="(field) in visible[idx]" :key="field" :props="slotProps">
            <q-input
              v-model="slotProps.row[field]"
              type="text"
              dense
              borderless
            />
            <!-- <q-popup-edit v-model="slotProps.row[field]" v-slot="scope">
              <q-input v-model="scope.value" dense autofocus @keyup.enter="scope.set" />
            </q-popup-edit> -->
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
    height: 250px;
    padding-bottom: 20px;
    margin-bottom: 20px;
  }
  .q-td {
    width:100px;
    font-style: normal;
  }
  .q-field__native * {
    color:red;
    text-transform: none;
    font-style: normal;
  }
</style>