<script setup>  
  import { onUnmounted, ref, inject } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { downloadCatalogueZip, downloadCsv } from '@/services/httpExport.js'
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
  const disable=ref({artist_data:true,user_data:false})
  const isLoading=ref({artist_data:false,user_data:false})
  const errorMessage = ref({artist_data:'',user_data:''})
  const successMessage = ref({artist_data:'',user_data:''})

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
    disable.value.artist_data=false
    if(obj.idExpo===0) disable.value.artist_data=true
    if(obj.idStatus.reduce((a, b) => parseInt(a) + parseInt(b), 0)===0) disable.value.artist_data=true
    if((obj.showRoom+obj.screen)===0) disable.value.artist_data=true
    paramsValues.value=`${obj.idExpo};[${obj.idStatus}];${obj.showRoom};${obj.screen}`
  }
  async function handleButtonAction(cs){
    isLoading.value[`${cs}`]=true
    const ctrl = newController(inFlight)
    try {
      let res=null
      switch(cs){
        case 'artist_data':
          res=await downloadCatalogueZip('export_catalogue',token.value,ctrl.signal,':idExpo,:idStatus,:showRoom,:screen',paramsValues.value)
          break
        case 'user_data':
          res=await downloadCsv('export_users','user_data',token.value,ctrl.signal)
      }
      // Trigger download in browser
      const blob = new Blob([res.data], { type: `${cs==='artist_data'?"application/zip":"text/csv"}` })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${cs}_export.${cs==='artist_data'?"zip":"csv"}`
      document.body.appendChild(a)
      a.click()
      // Cleanup
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      successMessage.value[`${cs}`] = t(`comps.export.${cs}.success`)
      setTimeout(() => {
        successMessage.value[`${cs}`]=''
      },3000)
    } catch (err) {
      console.error('Error in DataExport.vue:', err)
      errorMessage.value[`${cs}`] = t(`comps.export.${cs}.error`)
    } 
    finally {
      doneController(ctrl, inFlight)
      isLoading.value[`${cs}`]=false
    }
  }

  onUnmounted(() => { cancelAllInFlight(inFlight) })    // clean-up code after component has unmounted
  
</script>

<template>
  <fieldset>
    <legend > 
        {{ $t('comps.infos.export.artist_data.title')}}<DialogInfo :path="$t('comps.infos.export.artist_data.info')"></DialogInfo>
    </legend>
    <InputField 
      name="idExpo" 
      :label="$t('comps.export.artist_data.select_expo')" 
      field_type="select" 
      options="options_expo_export" 
      :required="false"
      @change="handleChange"
    ></InputField>    
    <div class="cb-container status">
      <label >{{$t('comps.export.artist_data.select_status')}}</label>
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
      <label >{{$t('comps.export.artist_data.select_mode')}}</label>
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
            label_fr: isLoading.artist_data?'Téléchargment en cours ...':'Générer l\'archive .zip',
            label_en: isLoading.artist_data?'Download in progress ...':'Generate .zip archive'
          }
        ]" 
        :disabled="{export:disable.artist_data}"
        :pulse="isLoading.artist_data"
        @button-action="handleButtonAction('artist_data')"
      ></FieldsetButton> 
      <div v-if="errorMessage.artist_data" class="message error">{{ errorMessage.artist_data }}</div>
      <div v-if="successMessage.artist_data" class="message success">{{ successMessage.artist_data }}</div>
    </div>  
  </fieldset>
  <fieldset>
    <legend > 
        {{ $t('comps.infos.export.user_data.title')}}<DialogInfo :path="$t('comps.infos.export.user_data.info')"></DialogInfo>
    </legend>
    <div class="bottom-container">
      <FieldsetButton 
        :buttons="[
          {
            name: 'export',
            icon: 'outbox',
            label_fr: isLoading.user_data?'Téléchargment en cours ...':'Générer le fichier .csv',
            label_en: isLoading.user_data?'Download in progress ...':'Generate .csv file'
          }
        ]" 
        :disabled="{export:disable.user_data}"
        :pulse="isLoading.user_data"
        @button-action="handleButtonAction('user_data')"
      ></FieldsetButton> 
      <div v-if="errorMessage.user_data" class="message error">{{ errorMessage.user_data }}</div>
      <div v-if="successMessage.user_data" class="message success">{{ successMessage.user_data }}</div>
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