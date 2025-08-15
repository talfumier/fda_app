<script setup>
import {ref,reactive,defineEmits,computed,onMounted,onUnmounted} from 'vue'
import _ from 'lodash'
import items from "./items.json"
import {zipToObject} from "../../utilityFunctions.js"
import InputField from '../common/fields/InputField.vue';
import { toastInfo } from '../common/toast/toast.js';
import { getEntities } from '@/services/httpEntities.js';

defineProps({
})
let obj={}
items.map((item) => {
  obj[item.name]=item.value!==undefined?item.value:""
})
const state=reactive({
  data:{...obj},
  creation: false
})

obj=zipToObject(Object.keys(obj),[false,true,false, state.creation ? false : true,state.creation ? false : true])
const formValid=reactive({...obj})
const disabled=computed(() => {
  return JSON.stringify(formValid).indexOf(false) !== -1;
})

const emit=defineEmits(['closeForm']) 

function handleChange(name,valid,val){
  state.data[name]=val
  formValid[name]=valid 
}
function handleClick(cs){
  switch(cs){
    case 'no_account':
      state.creation=!state.creation
      formValid.pwd_check=false
      formValid.cgu_cgv=false
      break
  }
}
function handleSubmit(){
  toastInfo('xxxxxx')
}
function onHandleClose(){
  emit('closeForm') //notify parent (HeaderMember)
}
// role data loading
const roles = ref([])
let ctrl // current AbortController
let alive = true // guard against updates after unmount
const loading = ref(false)
async function fetch() {
  if (ctrl) ctrl.abort()
  ctrl = new AbortController()
  loading.value = true
  const res=await getEntities('Role',ctrl.signal)
  if (!alive) return                // component gone? don't touch state
  roles.value = _.filter(res.data.data,(item) => {
    return [1,3,5].includes(item.idRole)    //artist, partner, organisation
  })
  loading.value = false
}
let roleOptions=[];
onMounted(async () => {
  await fetch()
  roleOptions = computed(() =>
    roles.value.map(r => [r.idRole, r[`role_${localStorage.getItem('locale')}`]])
  )
})
onUnmounted(() => { alive = false; ctrl?.abort() })    // clean-up code after component has unmounted
</script>

<template>
  <div class="modal">
    <div class="modal-content">
      <div class="icon">
        <q-icon name="cancel" size="3.5rem" color='blue-grey-9' @click="onHandleClose">
        </q-icon>
      </div>
      <div v-for="(item, idx) in items">
        <InputField  v-if="item.creation.includes(state.creation)"
          :key=idx 
          :name="item.name" 
          :field_type="item.field_type"
          :data_type="item.data_type"
          :label="$t('comps.login.'+item.name)" 
          :format="item.format" 
          :value="state.data[item.name]"
          :default="state.data[item.default]"
          :equal="item.name==='pwd_check'?state.data.pwd:null"
          :options="roleOptions"
          @onHandleChange="handleChange"
          @onHandleEnter="() => {
            if (disabled) return;
            handleSubmit();
          }"
        >
        </InputField>
      </div>
      <q-btn 
        color='primary'
        rounded standout
        no-wrap
        :label="$t('comps.login.sign_in')"
        :disabled="disabled"
        @click="handleSubmit">
      </q-btn>
      <div v-if="!state.creation" class="bottom-actions">
        <div
          class="action forgot-pwd "
          @click="() => {
            // requestNewPwd(data.data.user_id);
          }"
        >
          {{ $t('comps.login.pwd_forgot') }}
        </div>
        <div class="action no-account"
          @click="handleClick('no_account')"
        >
          {{ $t('comps.login.no_account') }}
        </div>
      </div>
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
  div.bottom-actions {
    display:flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  div.action {
    font-size: 1.6rem;
    color:grey;
    font-weight: 550;
    padding-top:7px;
    cursor: pointer;
  }
  div.action:hover{
    font-weight:900;
    transition: .3s;;
  }
  button.connect {
    margin-top:20px;
  }
</style>