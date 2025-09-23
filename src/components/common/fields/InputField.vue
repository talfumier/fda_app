<script setup>
  import { onMounted, onUnmounted, ref, computed, inject } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useFormatDate } from '@/composable/useFormatDate.js'
  import {validate} from"./validation.js"
  import { getEntitiesBySql } from '@/services/httpEntities.js'

  const props=defineProps({
    name:{type:String},
    field_type:{type:String,default:"input"},
    data_type:{type:String,default:"text"},
    icon:{type:String,default:null},
    label:{type:String},
    required:{type:Boolean,default:true},
    disabled:{type:Boolean,default:false},
    format:{type:String,default:'text'},  //used for input validation >>> validation.js
    highlight:{type:Boolean,default:true},  //label and border color highlight
    placeholder:{type:String,default:''},
    value:{type:[String, Number, Boolean,Date]},  
    maxLength:{type:Number,default:Infinity},
    equal:{type:[String]},
    rows:{type:Number},
    options:{type:[String,Array]}  //String >>> sql stored procedure
  })    
  
  const {token}=inject('userCookie')
  const { t,locale } = useI18n()    
  const {formatDate,formatDateTime}=useFormatDate()
  
  const data=ref(props.value), dirty=ref(false), type=ref(props.data_type), options=ref([])
  const fieldValid=ref({valid: true, msg: null})
  //OPTION GROUP OPTIONS PROCESSING 
  const group_options=computed(() => {
    if(props.field_type!=='option-group') return null
    return props.options.map((option) => {
      return {
        label:locale.value==='fr'?option.label_fr:option.label_en,
        value:option.value
      }
    })
  })
  //SELECT OPTIONS DATA LOADING FROM A STORED PROCEDURE
  const ctrl=new AbortController()   // AbortController's object' used in http request operation
  let alive = true // guard against updates after unmount
  onMounted(async() => {  //load options data from a stored procedure
    if(!props.options || Array.isArray(props.options)) return
    if (!alive) return                // component gone? don't touch state 
    const {data:res}=await getEntitiesBySql(
      props.options,
      token.value,
      ctrl.signal
    )
    const keys=Object.keys(res.data[0][0])
    res.data[0].map((item) => {
      options.value.push({value:item[keys[0]],text:{fr:item[keys[1]],en:item[keys[2]]}})
    })
  })
  onUnmounted(() => { alive = false; ctrl?.abort() })    // clean-up code after component has unmounted

  const emit = defineEmits(['change','iconClick'])
  //initial value processing 
  handleChange(data.value,'init')
  function handleChange(val,cs=null){
    if(!cs)dirty.value=true
    data.value=val
    let valid = {valid: true, msg: null};
    if (props.required && props.field_type !== 'select' && props.field_type !=='option-group' ) {
      valid = validate(val,props.name.includes('pwd')?'pwd':props.format);}
    Object.assign(fieldValid.value, valid)
    emit('change', //notify the parent component
      props.name,
      valid.valid,
      val,
      props.name==='pwd_check'?data.value:undefined
    ) 
  }
  function handleVisibility(){
     if(type.value==='text') type.value='password'
     else  type.value='text'
  }
  //DATA FORMATTING
  function formatData(){
    switch(props.format){
      case 'date':
        return formatDate(data.value)
      case 'date-time':
        return formatDateTime(data.value)
      default:
        return data.value
    }
  }
  //DATE AND TIME POPUP
  const dt=ref(['','00:00'])
  switch(props.format){
    case 'date':
      if(data.value && data)
        dt.value=formatDate(data.value)
      break
    case 'date-time':
      if(data.value && data){
        dt.value=formatDateTime(data.value).split(' ')
        dt.value[1]=dt.value[1].substring(0,6)
      }
  }
  const openDate = ref(null)
  const openTime=ref(null)
  function handleClick(cs){
    function openClose(date,time){      
      openDate.value=date
      openTime.value=time
    }
    switch(cs){
      case 'openDate':
        openClose(true,false)
        break      
      case 'openTime':
        openClose(false,true)
        break
      case 'ok':
        let date=dt.value[0].split('/')
        date=`${date[2]}-${date[1]}-${date[0]}`
        handleChange(`${date}T${dt.value[1]?dt.value[1]:'00:00'}:00.000`)
        openClose(false,false)
        break
      case 'clear':
        if(openDate.value) {
          dt.value[0]=dt.value[1]=''
          handleChange(null)
          openClose(false,false)
        }
        if(openTime.value) {
          dt.value[1]=''
          handleClick('ok')
        }
    }    
  }
</script>

<template>
  <div :class="['input-container',`${name}`,`${highlight?'highlight':''}`]" >
    <label 
      :for="name"
      :class="[`${type==='checkbox'?'checkbox':''}`]" 
      v-html="`${label}${required && !name.includes('_fr') && !name.includes('_en')&& type !== 'checkbox' ? ' *' : ''}`"
    >
    </label>
    <q-icon  v-if="(format==='date' || format==='date-time')"
      class="date"
      name="event"
      size="2.7rem"
      color='primary'
      @click="handleClick('openDate')"
    >
    </q-icon>
    <q-icon  v-if="(format==='date-time')"
      class="time"
      name="access_time"
      size="2.7rem"
      color='primary'
      @click="handleClick('openTime')"
    >
    </q-icon>
    <q-popup-proxy v-if="openDate || openTime" anchor="bottom left" self="top left">
        <q-date v-if="openDate" v-model="dt[0]" landscape mask="DD/MM/YYYY"/>
        <q-time v-if="openTime" v-model="dt[1]" landscape format24h/>
        <div class="controls">
          <q-btn flat :label="$t('common.clear')" 
            @click="handleClick('clear')" 
          />
          <q-btn :disabled="!dt[0]" color="primary" label="OK" 
            @click="handleClick('ok')" 
          />
        </div>
    </q-popup-proxy>
    
    <input v-if="field_type==='input'"
      :name="name"
      :type="type"
      :class="['text',disabled?'disabled':'',dirty?'dirty':'',fieldValid.valid?'valid':'not-valid',name.includes('pwd')?'pwd':'']"
      :placeholder="placeholder"
      :value="formatData()"
      :equal="equal"
      :disabled="disabled" 
      :readonly="format==='date' || format==='date-time'"
      :autoComplete="name!=='pwd' && name!=='pwd_check'?'on':'off'"
      @change="handleChange($event.target.value)"
      @blur="(e) => {
        if(name === 'pwd_check' && fieldValid.valid) {
          const valid = validate(e.target.value, name, equal)          
          Object.assign(fieldValid, valid)
        }    
      }"
      @input="(e) => {
        if(dirty) handleChange(e.target.value)
      }"      
      @click="() => {
        if(format==='date' || format==='date-time') handleClick('openDate')
      }"
    />    
    <q-icon  v-if="icon"
      class="icon"
      :name="icon"
      size="3rem"
      color='primary'
      @click="emit('iconClick')"
    >
    </q-icon>
    <q-icon  v-if="data_type==='password'"
      class="pwd"
      :name="type==='text'?'visibility_off':'visibility'" 
      size="3rem"
      color='blue-grey-9'
      @click="handleVisibility"
    >
    </q-icon>

    <input v-if="field_type==='checkbox'"
      :id="name"
      :name="name"
      type="checkbox"
      v-model="data" :true-value="1" :false-value="0"
      :value="data"
      :disabled="disabled" 
      @change="handleChange($event.target.value)"
      
    />
    
    <textarea v-if="field_type==='textarea'"
      :name="name"
      :type="type"
      :class="['text',disabled?'disabled':'',dirty?'dirty':'',fieldValid.valid?'valid':'not-valid']"
      :placeholder="placeholder"
      :value="data"
      :disabled="disabled" 
      autoComplete="on"
      :maxlength="maxLength"
      :rows="rows"
      @change="handleChange($event.target.value)"
      @input="(e) => {
        if(dirty)handleChange(e.target.value)
      }"
    >
    </textarea>
    
    <select v-if="field_type==='select'"
      :class="['text',disabled?'disabled':'',dirty?'dirty':'',fieldValid.valid?'valid':'not-valid']"
      :value="data?.toString().length>0?data:'-1'"
      :disabled="disabled"
      @change="handleChange($event.target.value)"     
    >
      <option key="-1" value="-1" disabled hidden>{{ t('common.select') }}</option>
      <option 
        v-for="(option,idx) in options" 
        :key="idx"
        :value="option.value">
          {{option.value?option.text[locale]:''}}
      </option>
    </select>
    <!-- failed validation alert message -->
    <div v-if="dirty && !fieldValid.valid && fieldValid.msg && name!=='cgu_cgv'" 
      class="alert" 
      v-html="t(fieldValid.msg)"
    >
    </div>

    <q-option-group v-if="field_type==='option-group'"
      v-model="data"
      :options="group_options"
      type='radio'
      @update:model-value="handleChange"
    />
  </div>
</template>

<style scoped>
  ::placeholder {
    text-align: left;
    vertical-align: middle;
  }
  div.input-container {
    display:flex;
    flex-direction: column;
    align-items: flex-start;
    position:relative;
    font-size: 1.7rem;
    opacity: 0.9;
    padding:5px 0;
    border:none;
  }
  div.input-container:has(.checkbox) {
    flex-direction: row-reverse;
    justify-content: left;    
    align-items: center;
  }
  div.input-container:has(.pwd-reset){
    justify-content: center;
  }
  .controls {
    display:flex;
    justify-content: right;
  }
  label.checkbox {
    font-weight:400;
    color:var(--black);
    cursor: pointer;
  }
  input[type="checkbox"] {
    transform: scale(1.5);
    margin:0px 10px 0 5px;
    width: fit-content;
    cursor: pointer;
  }
  textarea, input, select {
    padding:3px 10px;
    border: solid 2px grey;
    border-radius: 5px;
    resize: vertical;
    width:100%;
  }
  div.modal input:not(:has(+ .q-icon)), div.modal select {
    padding:10px;
  }
  input, select {
    height:3.2rem;
  }
  div.input-container.highlight:has(.not-valid):not(:has(.checkbox)) label{
    color:red;
  }
  .valid.dirty {
    border-color: green;
  }
  div.input-container.highlight .not-valid {
    border-color:red;
  }
  textarea.disabled, input.disabled {
    cursor:not-allowed;
    opacity:1 !important;
  }
  select {
    padding-right: 10px;;
    cursor: pointer;
  }
  textarea:focus,input:focus,select:focus {
    outline: none ;
    box-shadow: 0 0 10px #719ECE;
  }
  .q-icon {
    position:absolute;
  }
  .q-icon.date {
    top:30px;
    left:10px;
    cursor: pointer;
  }
  div.input-container.completionDate .q-icon.date {
    top:24px;
  }
  .q-icon.time {
    top:30px;
    right:10px;
    cursor: pointer;
  }
  .q-icon.pwd {
    top:33px;
    right:8px;    
  }
  .q-icon.icon {
    top:28px;
    right:8px;   
    cursor: pointer; 
  }
  input:has(+ .q-icon) {
    padding-right:40px;
  }
  div.input-container:has(.q-icon.date) input {
    padding-left:60px;
  }
  div.alert {
    font-size:1.5rem;
    line-height: 2rem;
    padding:5px 10px;
    border-radius: 5px;
    color:red;
    background-color: rgb(243, 227, 227);
  }
  .q-option-group {
    display:flex;
    flex-wrap: nowrap;
    gap:30px;
  }
  /* CUSTOMIZATION I.A.W FIELD NAME */
  div.modal-content.login input, div.modal-content.login select, 
  div.modal-content.reset input, div.modal-content.reset select {
   height:4.3rem;
  }
  div.input-container.cgu_cgv {   /*FormLogin*/
    margin-top: 0px;
  }
  div.input-container:has(input[type="checkbox"]) {
    flex-direction: row-reverse;
    align-items: center;
  }
  div.input-container.email textarea {
    min-width:350px;
  }
  div.input-container.lang select {
    width:170px;
  }
  div.input-container.cgu_cgv_date input {    /*user form*/
    text-align: center;
  } 
  div.input-container.newsletter,div.input-container.reserved, div.input-container.completionDate {
    padding-top: 20px;;
  }
  fieldset.links input {
    width:300px;
  }
</style>