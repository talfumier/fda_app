<script setup>
  import {reactive,computed} from 'vue'
  import { useRouter } from 'vue-router'
  import items from "./items.json"
  import {zipToObject} from "../../utilityFunctions.js"
  import InputField from '../common/fields/InputField.vue'
  import { resetPassword } from '@/services/httpUsers.js'

  const {id,random}=defineProps({
    id:{type:String,required:true},
    random:{type:String,required:true}  
  })
  const router = useRouter()

  let obj={}
  items.recover.map((item) => {
    obj[item.name]=item.value!==undefined?item.value:""
  })
  const state=reactive({
    data:{...obj}
  })

  obj=zipToObject(Object.keys(obj),[false,false])
  const formValid=reactive({...obj})
  const disabled=computed(() => {
    return JSON.stringify(formValid).indexOf(false) !== -1;
  })

  function onChange(name,valid,val){
    state.data[name]=val
    formValid[name]=valid 
  }
  async function handleSubmit(){
    await resetPassword(id,random,state.data.pwd)
    handleClose()
  }
  function handleClose(){
    router.push('/')
  }

</script>

<template>
  <div :class="['modal']">
    <div class="modal-content">
      <div class="icon">
        <q-icon name="cancel" size="3.5rem" color='blue-grey-9' @click="handleClose" tabindex="-1">
        </q-icon>
      </div>
      <div v-for="(item, idx) in items.recover">
        <InputField  
          :key=idx 
          :name="item.name" 
          :field_type="item.field_type"
          :data_type="item.data_type"
          :label="$t('comps.login.'+item.name)" 
          :format="item.format" 
          :value="state.data[item.name]"
          :default="state.data[item.default]"
          :equal="item.name==='pwd_check'?state.data.pwd:null"
          @change="onChange"
        >
        </InputField>
      </div>
      <q-btn 
        color='primary'
        rounded standout
        no-wrap
        :label="$t('comps.login.execute')"
        :disabled="disabled"
        @click="handleSubmit"
      >
      </q-btn>
    </div>
  </div>
</template>

<style scoped>
  div.modal {
    position:fixed;
    top:25%;
    left:50%;
  }
  div.modal-content {
    display:grid;
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    position:relative;
    background-color: #fefefe;
    margin: auto;
    padding: 20px;
    border: 1px solid #888;
    border-radius: 10px;
    min-width:350px;
  }
  div.icon {
    display:flex;
    justify-content: right;
  }
  .q-icon {
    margin:-15px;
    cursor: pointer;
    z-index: 5000;
  }
  .q-btn {
    margin-top: 2rem;
    margin-bottom: 1rem;
  }
  .q-btn:hover {
    opacity: 0.8;
  }
  button.connect {
    margin-top:20px;
  }
</style>