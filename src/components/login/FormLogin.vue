<script setup>
import {inject,reactive,defineEmits,computed,onMounted,onUnmounted} from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import _ from 'lodash'
import items from "./items.json"
import {zipToObject} from "../../utilityFunctions.js"
import InputField from '../common/fields/InputField.vue'
import { getEntities } from '@/services/httpEntities.js'
import { register,login, forgotPassword } from '@/services/httpUsers.js'
import { decodeJWT } from '@/services/httpUsers.js'
import { toastInfo } from '@/composable/toast.js'
import { translate } from '@/services/httpGoogleServices.js'
import { setUpTokenExpiry } from './tokenExpiry.js'

defineProps({})
const{locale,t}=useI18n()
const {read, set} = inject('userCookie')
const router=useRouter()
// state initialization
let obj={}
items.login.map((item) => {
  obj[item.name]=item.value!==undefined?item.value:""
})
const state=reactive({
  data:{...obj},
  creation: false
})

obj=zipToObject(Object.keys(obj),[false,true,false, state.creation ? false : true,state.creation ? false : true],false)
const formValid=reactive({...obj})
const disabled=computed(() => {
  return JSON.stringify(formValid).indexOf(false) !== -1;
})

const emit=defineEmits(['closeForm','logIn']) 

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
async function handleSubmit(){
  if (!read()) {
    let res = null;
    switch (state.creation) {
      case true: //register case
        res = await register(  //error handling and success message managed by axios interceptor in httpService.js
          state.data.email,
          state.data.role,
          locale.value,
          state.data.pwd
        );
        break;
      case false: //login case
        res = await login(state.data.email, state.data.pwd);
        if(res.headers) {
          const {email,exp} = decodeJWT(res.headers['x-auth-token']); //exp is expressed in seconds since EPOCH
          set(res.headers['x-auth-token'], { expires: new Date(exp * 1000) })          
          router.replace({ name: 'member home' })  //send to dashboard page (logic in route.js)
          //set-up warnings for token expiry
          setUpTokenExpiry(t,exp,router)
          emit('logIn',email)         
        }
    }
    emit('closeForm')
  }
  else {
    const {data:text}=await translate({text:`User '${state.data.email}' is already signed-in.`,to:locale.value,from:'en'})
    toastInfo(text)
  }
}
async function requestNewPwd(){
  await forgotPassword(state.data.email,locale.value)
}
function handleClose(){
  emit('closeForm') //notify parent (HeaderMember)
}
// role data loading
let ctrl // current AbortController
let alive = true // guard against updates after unmount
async function fetch() {
  if (ctrl) ctrl.abort()
  ctrl = new AbortController()
  const {data}=(await getEntities('Role',ctrl.signal)).data
  if (!alive) return                // component gone? don't touch state  
  return _.filter(data,(item) => {
    return [1,5,6].includes(item.idRole)    //artist, organisation, organisation admin
  })
}
let roleOptions=[];
onMounted(async () => {  
  roleOptions = (await fetch()).map(r => [r.idRole, r.role_fr, r.role_en])
})
onUnmounted(() => { alive = false; ctrl?.abort() })    // clean-up code after component has unmounted
</script>

<template>
  <div :class="['modal']">
    <div class="modal-content">
      <div class="icon">
        <q-icon name="cancel" size="3.5rem" color='blue-grey-9' @click="handleClose" tabindex="-1">
        </q-icon>
      </div>
      <div v-for="(item, idx) in items.login">
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
          @change="handleChange"
        >
        </InputField>
      </div>
      <q-btn 
        color='primary'
        rounded standout
        no-wrap
        :label="$t('comps.login.sign_in')"
        :disabled="disabled"
        @click="handleSubmit"
      >
      </q-btn>
      <div v-if="!state.creation" class="bottom-actions">
        <div
          :class="['action', 'forgot-pwd',!formValid.email?'disabled':'']"
          @click="formValid.email && requestNewPwd()"
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
  div.action.disabled {
    cursor:not-allowed;
  }
  div.action:hover{
    font-weight:900;
    transition: .3s;;
  }
  button.connect {
    margin-top:20px;
  }
</style>