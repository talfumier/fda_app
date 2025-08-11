<script setup>
import { ref, reactive } from 'vue';
import InputField from '../common/InputField.vue';

defineProps({
})

</script>

<template>
  <div class="modal">
    <div class="modal-content">
    <InputField>
    
    </InputField>
    </div>
  </div>
</template>

<style scoped>
  div.modal {
    position:fixed;
    top:0;
    left:0;
    width:100%;
    height:100%;
    padding-top:97px;
    background-color: rgba(0, 0, 0, 0.4);
    z-index: 5000;
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
    max-width:350px;
  }
  div.modal-content div.input-container {
    position:relative;
    max-width:100%;
  }
  div.modal-content div.input-container label{
    padding: 10px 0 5px;
  }
  div.modal-content div.input-container i {
    position:absolute;
    top:42px;
    right:5px;
    cursor: pointer;
  }
  div.modal-content label.list-item-title {
    font-size:1.5rem;
    margin:15px 0 0;
  }
  div.modal-content div.bottom-actions {
    display:flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  div.bottom-actions div.action {
    font-size: 1.6rem;
    color:grey;
    font-weight: 550;
    padding-top:7px;
    cursor: pointer;
  }
  div.bottom-actions div.action:hover{
    font-weight:900;
    transition: .3s;;
  }
  div.modal-content button.connect {
    margin-top:20px;
  }
</style>