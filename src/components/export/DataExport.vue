<script setup>  
  import { onUnmounted, ref, inject } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { downloadCatalogueZip } from '@/services/httpCloudinary'
  import { newController,doneController,cancelAllInFlight } from '@/utilityFunctions.js'
  import DialogInfo from '../common/DialogInfo.vue'
  import InputField from '../common/fields/InputField.vue'
  import FieldsetButton from '../common/page/details/FieldsetButton.vue'

  defineProps({
  })

  const {token}=inject('userCookie')
  const {t}=useI18n()  
  const inFlight=new Set()

  const paramsValues=ref('')
  const disable=ref(true)
  const isLoading=ref(false)
  const errorMessage = ref('')
  const successMessage = ref('')

  const obj={idExpo:0,idStatus:[0,0,0],showRoom:0,screen:0}
  function handleChange(name,valid,val){
    val=parseInt(val===false?0:val===true?1:val)
    switch(name){
      case 'idStatus8':
        obj.idStatus[0]=val===1?8:0
        break
      case 'idStatus10':
        obj.idStatus[1]=val===1?10:0
        break
      case 'idStatus27':
        obj.idStatus[2]=val===1?27:0
        break
      default:
        obj[name]=val
    }
    disable.value=false
    if(obj.idExpo===0) disable.value=true
    if(obj.idStatus.reduce((a, b) => parseInt(a) + parseInt(b), 0)===0) disable.value=true
    if((obj.showRoom+obj.screen)===0) disable.value=true
    paramsValues.value=`${obj.idExpo};[${obj.idStatus}];${obj.showRoom};${obj.screen}`
  }
  async function handleButtonAction(){
    isLoading.value=true
    const ctrl = newController(inFlight)
    try {
      const zipResponse=await downloadCatalogueZip('export_catalogue',token.value,ctrl.signal,':idExpo,:idStatus,:showRoom,:screen',paramsValues.value)
      // Trigger download in browser
      const blob = new Blob([zipResponse.data], { type: 'application/zip' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'artists_export.zip'
      document.body.appendChild(a)
      a.click()
      // Cleanup
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      successMessage.value = t('comps.export.success_catalogue')
      setTimeout(() => {
        successMessage.value=''
      },3000)
    } catch (err) {
      console.error('Error in DataExport.vue:', err)
      errorMessage.value = t('comps.export.error_catalogue')
    } 
    finally {
      doneController(ctrl, inFlight)
      isLoading.value=false
    }
  }

  onUnmounted(() => { cancelAllInFlight(inFlight) })    // clean-up code after component has unmounted
  
</script>

<template>
  <fieldset>
    <legend > 
        {{ $t('comps.infos.export.title')}}<DialogInfo :path="$t('comps.infos.export.info')"></DialogInfo>
    </legend>
    <InputField 
      name="idExpo" 
      :label="$t('comps.export.select_expo')" 
      field_type="select" 
      options="options_expo_export" 
      :required="false"
      @change="handleChange"
    ></InputField>    
    <div class="cb-container status">
      <label >{{$t('comps.export.select_status')}}</label>
      <InputField 
        name="idStatus8" 
        :label="$t('comps.list_items.actions_menu.booking.candidate')" 
        field_type="checkbox" 
        data_type="checkbox" 
        format="integer"
        @change="handleChange"
      >
      </InputField><InputField 
        name="idStatus10" 
        :label="$t('comps.list_items.actions_menu.booking.accepted')" 
        field_type="checkbox" 
        data_type="checkbox" 
        format="integer"
        @change="handleChange"
      ></InputField>
      <InputField 
        name="idStatus27" 
        :label="$t('comps.list_items.actions_menu.booking.payment')" 
        field_type="checkbox" 
        data_type="checkbox" 
        format="integer"
        @change="handleChange"
      ></InputField>
    </div>
    <div class="cb-container media">
      <label >{{$t('comps.export.select_mode')}}</label>
      <InputField 
        name="showRoom" 
        :label="$t('comps.form_details.booking_oeuvre.showRoom')" 
        field_type="checkbox" 
        data_type="checkbox" 
        format="integer"
        @change="handleChange"
      >
      </InputField><InputField 
        name="screen" 
        :label="$t('comps.form_details.booking_oeuvre.screen')" 
        field_type="checkbox" 
        data_type="checkbox" 
        format="integer"
        @change="handleChange"
      ></InputField>
    </div>
    <div class="bottom-container">
      <FieldsetButton 
        :buttons="[
          {
            name: 'export',
            icon: 'outbox',
            label_fr: isLoading?'Téléchargment en cours ...':'Générer l\'archive .zip',
            label_en: isLoading?'Download in progress ...':'Generate .zip archive'
          }
        ]" 
        :disabled="{export:disable}"
        :pulse="isLoading"
        @button-action="handleButtonAction"
      ></FieldsetButton> 
      <div v-if="errorMessage" class="message error">{{ errorMessage }}</div>
      <div v-if="successMessage" class="message success">{{ successMessage }}</div>
    </div>  
  </fieldset>
  
</template>

<style scoped>  
  fieldset {
    display:flex;
    flex-direction: column;
    align-items: flex-start;
    gap:10px;
    margin-top:5px;
    padding:0 10px 5px;
    border-radius: 5px;    
    border-color:rgb(154, 154, 238);
    border-width: 1px;
    width:500px;
    margin:10px 20px;
  }
  legend {
    font-size:1.7rem;
    line-height: 2.2rem;
    text-wrap: nowrap;
    font-style: italic;
    font-weight:400;
    color:var(--blue);
    padding:0 5px;
  }
  div.cb-container {
    display:grid;
    grid-template-rows: 15px auto;
    grid-template-columns: repeat(3,auto);
    column-gap: 10px;
  }
  label {
    grid-row: 1;
    grid-column: 1/-1;
  }
  .bottom-container {
    display:flex;
    flex-direction: column;
    align-items: center;
    margin:0 auto;
    padding-bottom:10px;
  }
  .message {
    text-align: center;    
    margin-top: 10px;
    padding: 10px;
    border-radius: 4px;
  }
  .error {
    color: #d32f2f;
    background-color: #ffebee;
  }
  .success {
    color: #388e3c;
    background-color: #e8f5e9;
  }
  
</style>