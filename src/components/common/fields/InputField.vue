<script setup>
  import { useI18n } from 'vue-i18n'
  import { ref } from 'vue';
  import {validate} from"./validation.js"

  const props=defineProps({
    name:{type:String},
    field_type:{type:String,default:"input"},
    data_type:{type:String,default:"text"},
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
    options:{type:Array}
  })    
  const { t,locale } = useI18n()  
  
  const data=ref(props.value), dirty=ref(false), type=ref(props.data_type)
  const fieldValid=ref({valid: true, msg: null})

  const emit = defineEmits(['change'])
  //initial value processing 
  handleChange(data.value,'init')
  function handleChange(val,cs=null){
    if(!cs)dirty.value=true
    data.value=val
    let valid = {valid: true, msg: null};
    if (props.required && props.field_type !== 'select') {
      valid = validate(val,props.name.includes('pwd')?'pwd':props.format);}
    Object.assign(fieldValid.value, valid)
    emit('change', //notify the parent component
      props.name,
      valid.valid,
      val,// props.format !== "date" && props.format !== "date-time" ? val : strToDate(val),
      props.name==='pwd_check'?data.value:undefined
    ) 
  }
  function handleVisibility(){
     if(type.value==='text') type.value='password'
     else  type.value='text'
  }

</script>

<template>
  <div :class="['input-container',`${name}`,`${highlight?'highlight':''}`]" >
    <label 
      :for="name"
      :class="[`${type==='checkbox'?'checkbox':''}`]" 
      v-html="`${label}${required && type !== 'checkbox' ? ' *' : ''}`"
    >
    </label>
    
    <input v-if="field_type==='input'"
      :name="name"
      :type="type"
      :class="['text',disabled?'disabled':'',dirty?'dirty':'',fieldValid.valid?'valid':'not-valid',name.includes('pwd')?'pwd':'']"
      :placeholder="placeholder"
      :value="data"
      :equal="equal"
      :disabled="disabled" 
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
    />
    <q-icon  v-if="data_type==='password'"
      :name="type==='text'?'visibility_off':'visibility'" size="3rem"
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
      :value="data?.toString().length>0?data:'-1)'"
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
  </div>
</template>

<style scoped>
  ::placeholder {
    text-align: center;
    vertical-align: middle;
  }
  div.input-container {
    display:flex;
    flex-direction: column;
    align-items: flex-start;
    position:relative;
    font-size: 1.7rem;
    opacity: 0.8;
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
  div.modal input, div.modal select {
    padding:10px;
  }
  input, select {
    height:3.2rem;
  }
  input.pwd {
    padding-right: 45px;
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
    top:35px;
    right:8px;
    color: red;
    
  }
  div.alert {
    font-size:1.5rem;
    line-height: 2rem;
    padding:5px 10px;
    border-radius: 5px;
    color:red;
    background-color: rgb(243, 227, 227);
  }
  /* CUSTOMIZATION I.A.W FIELD NAME */
  div.input-container.cgu_cgv {   /*FormLogin*/
    margin-top: 15px;
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
  div.input-container.newsletter {
    padding-top: 20px;;
  }
</style>