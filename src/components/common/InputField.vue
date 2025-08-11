<script setup>
  import { ref,reactive } from 'vue';

  defineProps({
    name:String,
    label:String,
    required:{type:Boolean,default:true},
    disabled:{type:Boolean,default:false},
    format:{type:String,required:false},
    placeholder:{type:String,required:false},
    rows:{type:String,required:false},
    value:{type:[String,Number,Boolean,Date]}
  })

</script>

<template>
  <div className="input-container">
    <label>{{`${"label"}${"required" ? " *" : ""}`}}</label>
    <input
      :type="type"
      :class="['text',disabled?'disabled':'']"
      :placeholder="placeholder"
      :value="value"
      :disabled="disabled" 
      :name="name"
      autoComplete="on"
      @blur=""
      @keydown=""
    />
    <!-- {name.includes("password") && ( -->
      <i
        :class="['fa-regular',`fa-eye${type!=='password'?'-slash':''}`]"
        @click=""
      ></i>
    <div class="alert">xxxxxx</div>
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
    font-size: 1.7rem;
    opacity: 0.8;
    border:none;
    max-width:300px;
  }
  div.input-container:has(.pwd-reset){
    justify-content: center;
  }
  div.input-container textarea, 
  div.input-container input,
  div.input-container select {
    padding:5px;
    border: solid 1px grey;
    border-radius: 5px;
    resize: vertical;
  }
  div.input-container textarea.disabled,
  div.input-container input.disabled {
    cursor:not-allowed;
  }
  div.input-container select {
    cursor: pointer;
  }
  option.option-default {
    color:#b97597;
  }
  div.input-container:has(.not-valid) label{
    color:red;
  }
  div.input-container .valid {
    border-color: green;
  }
  div.input-container .not-valid {
    border-color:red;
  }
  div.input-container textarea:focus, 
  div.input-container input:focus,
  div.input-container select:focus {
    outline: none ;
    box-shadow: 0 0 10px #719ECE;
  }
  div.alert {
    font-size:1.5rem;
    line-height: 2rem;
    padding:5px 10px;
    border-radius: 5px;
    color:red;
    background-color: rgb(243, 227, 227);
  }

</style>