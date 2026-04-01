<script setup>  
  import { onUnmounted, ref, inject } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { downloadCatalogueZip, downloadCsv,downloadPDF } from '@/services/httpExport.js'
  import { newController,doneController,cancelAllInFlight } from '@/utilityFunctions.js'
  import DialogInfo from '../common/DialogInfo.vue'
  import InputField from '../common/fields/InputField.vue'
  import FieldsetButton from '../common/page/details/FieldsetButton.vue'

  const {token}=inject('userCookie')
  const {t}=useI18n()  
  const inFlight=new Set()

  const paramsValues=ref('')
  const disable=ref({artist_data:true,user_data:false,deposit_collection_data:true,catalogue:true,payment_data:true})
  const isLoading=ref({artist_data:false,user_data:false,deposit_collection_data:false,catalogue:false,payment_data:false})
  const errorMessage = ref({artist_data:'',user_data:'',deposit_collection_data:'',catalogue:'',payment_data:''})
  const successMessage = ref({artist_data:'',user_data:'',deposit_collection_data:'',catalogue:'',payment_data:''})

  const obj={
    artist_data:{idExpo:0,idStatus:[0,0,0],showRoom:0,screen:0},
    catalogue:{idExpo:0,idStatus:[0,0,0]},
    payment_data:{idExpo:0},
    deposit_collection_data:{idExpo:0}
  }
  
  function handleChange(name,valid,val,cs){
    val=parseInt(val===false?0:val===true?1:val)
    switch(name){
      case 'idStatus8':     //candidate
        obj[cs].idStatus[0]=val===1?8:0
        break
      case 'idStatus10':    //accepted
        obj[cs].idStatus[1]=val===1?10:0
        break
      case 'idStatus27':    //payment received
        obj[cs].idStatus[2]=val===1?27:0
        break
      default:
        obj[cs][name]=val
    }
    disable.value[cs]=false
    if(obj[cs].idExpo===0) disable.value[cs]=true
    if(cs==='payment_data' || cs==='deposit_collection_data') return
    if(obj[cs].idStatus.reduce((a, b) => parseInt(a) + parseInt(b), 0)===0) disable.value[cs]=true
    if((obj.artist_data.showRoom+obj.artist_data.screen)===0) disable.value.artist_data=true
    paramsValues.value=`${obj[cs].idExpo};[${obj[cs].idStatus}]`
    if(cs==='artist_data') paramsValues.value=`${paramsValues.value};${obj[cs].showRoom};${obj[cs].screen}`
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
          res=await downloadCsv('export_users',-1,'user_data',token.value,ctrl.signal)  //-1 means all idExpo
          break
        case 'deposit_collection_data':
          res=await downloadPDF(token.value,ctrl.signal,window.location.origin,'member/deposit_collection_print/fr','idExpo',obj.deposit_collection_data.idExpo,'Dépôt/retrait des oeuvres')
          break
        case 'catalogue':
          res=await downloadPDF(token.value,ctrl.signal,window.location.origin,'member/catalogue_print',':idExpo,:idStatus',paramsValues.value,'Catalogue')
          break
        case 'payment_data':
          res=await downloadCsv('export_payment',obj.payment_data.idExpo,'payment_data',token.value,ctrl.signal)
      }
      // Trigger download in browser
      const blob = new Blob([res.data], { type: `${cs==='artist_data'?"application/zip":(cs==='user_data' || cs==='payment_data'?"text/csv":"application/pdf")}` })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${cs}_export.${cs==='artist_data'?"zip":(cs==='user_data' || cs==='payment_data'?'csv':'pdf')}`
      document.body.appendChild(a)
      a.click()
      successMessage.value[`${cs}`] = t(`comps.export.${cs}.success`)
      setTimeout(() => {
        // Cleanup
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
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
      @change="(name,valid,val) => {
          handleChange(name,valid,val,'artist_data')
        }"
    ></InputField>  
    <div class="cb-container">
      <label >{{$t('comps.export.artist_data.select_status')}}</label>
      <div class="status">
        <InputField 
          name="idStatus8" 
          :label="$t('comps.list_items.actions_menu.booking.candidate')" 
          field_type="checkbox" 
          data_type="checkbox" 
          format="integer"
          @change="(name,valid,val) => {
            handleChange(name,valid,val,'artist_data')
          }"
        >
        </InputField><InputField 
          name="idStatus10" 
          :label="$t('comps.list_items.actions_menu.booking.accepted')" 
          field_type="checkbox" 
          data_type="checkbox" 
          format="integer"
          @change="(name,valid,val) => {
            handleChange(name,valid,val,'artist_data')
          }"
        ></InputField>
        <InputField 
          name="idStatus27" 
          :label="$t('comps.list_items.actions_menu.booking.payment')" 
          field_type="checkbox" 
          data_type="checkbox" 
          format="integer"
          @change="(name,valid,val) => {
            handleChange(name,valid,val,'artist_data')
          }"
        ></InputField>
      </div>
      <label >{{$t('comps.export.artist_data.select_mode')}}</label>
      <div class="media">
        <InputField 
          name="showRoom" 
          :label="$t('comps.form_details.booking_oeuvre.showRoom')" 
          field_type="checkbox" 
          data_type="checkbox" 
          format="integer"
          @change="(name,valid,val) => {
            handleChange(name,valid,val,'artist_data')
          }"
        >
        </InputField><InputField 
          name="screen" 
          :label="$t('comps.form_details.booking_oeuvre.screen')" 
          field_type="checkbox" 
          data_type="checkbox" 
          format="integer"
          @change="(name,valid,val) => {
            handleChange(name,valid,val,'artist_data')
          }"
        ></InputField>
      </div>
    </div>  
    <div class="bottom-container">
      <FieldsetButton 
        :buttons="[
          {
            name: 'export',
            icon: 'outbox',
            label_fr: isLoading.artist_data?'Téléchargement en cours ...':'Générer l\'archive .zip',
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
            label_fr: isLoading.user_data?'Téléchargement en cours ...':'Générer le fichier .csv',
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
  <fieldset>
    <legend > 
        {{ $t('comps.infos.export.payment_data.title')}}<DialogInfo :path="$t('comps.infos.export.payment_data.info')"></DialogInfo>
    </legend>
    <InputField 
      name="idExpo" 
      :label="$t('comps.export.artist_data.select_expo')" 
      field_type="select" 
      options="options_expo_export" 
      :required="false"
      @change="(name,valid,val) => {
          handleChange(name,valid,val,'payment_data')
        }"
    ></InputField>  
    <div class="bottom-container">
      <FieldsetButton 
        :buttons="[
          {
            name: 'export',
            icon: 'outbox',
            label_fr: isLoading.payment_data?'Téléchargement en cours ...':'Générer le fichier .csv',
            label_en: isLoading.payment_data?'Download in progress ...':'Generate .csv file'
          }
        ]" 
        :disabled="{export:disable.payment_data}"
        :pulse="isLoading.payment_data"
        @button-action="handleButtonAction('payment_data')"
      ></FieldsetButton> 
      <div v-if="errorMessage.payment_data" class="message error">{{ errorMessage.payment_data }}</div>
      <div v-if="successMessage.payment_data" class="message success">{{ successMessage.payment_data }}</div>
    </div>  
  </fieldset> 
  <fieldset>
    <legend > 
        {{ $t('comps.infos.export.deposit_collection_data.title')}}<DialogInfo :path="$t('comps.infos.export.deposit_collection_data.info')"></DialogInfo>
    </legend>
    <InputField 
      name="idExpo" 
      :label="$t('comps.export.artist_data.select_expo')" 
      field_type="select" 
      options="options_expo_export" 
      :required="false"
      @change="(name,valid,val) => {
          handleChange(name,valid,val,'deposit_collection_data')
        }"
    ></InputField>  
    <div class="bottom-container">
      <FieldsetButton 
        :buttons="[
          {
            name: 'export',
            icon: 'outbox',
            label_fr: isLoading.deposit_collection_data?'Téléchargement en cours ...':'Générer le document .pdf',
            label_en: isLoading.deposit_collection_data?'Download in progress ...':'Generate .pdf document'
          }
        ]" 
        :disabled="{export:disable.deposit_collection_data}"
        :pulse="isLoading.deposit_collection_data"
        @button-action="handleButtonAction('deposit_collection_data')"
      ></FieldsetButton> 
      <div v-if="errorMessage.deposit_collection_data" class="message error">{{ errorMessage.deposit_collection_data }}</div>
      <div v-if="successMessage.pdeposit_collection_data" class="message success">{{ successMessage.deposit_collection_data }}</div>
    </div>  
  </fieldset> 
  <fieldset>
    <legend > 
        {{ $t('comps.infos.export.catalogue.title')}}<DialogInfo :path="$t('comps.infos.export.catalogue.info')"></DialogInfo>
    </legend>
    <InputField 
      name="idExpo" 
      :label="$t('comps.export.artist_data.select_expo')" 
      field_type="select" 
      options="options_expo_export" 
      :required="false"
      @change="(name,valid,val) => {
          handleChange(name,valid,val,'catalogue')
        }"
    ></InputField>  
    <div class="cb-container"> 
      <label >{{$t('comps.export.artist_data.select_status')}}</label>
      <div class="status">
        <InputField 
          name="idStatus8" 
          :label="$t('comps.list_items.actions_menu.booking.candidate')" 
          field_type="checkbox" 
          data_type="checkbox" 
          format="integer"
          @change="(name,valid,val) => {
            handleChange(name,valid,val,'catalogue')
          }"
        >
        </InputField><InputField 
          name="idStatus10" 
          :label="$t('comps.list_items.actions_menu.booking.accepted')" 
          field_type="checkbox" 
          data_type="checkbox" 
          format="integer"
          @change="(name,valid,val) => {
            handleChange(name,valid,val,'catalogue')
          }"
        ></InputField>
        <InputField 
          name="idStatus27" 
          :label="$t('comps.list_items.actions_menu.booking.payment')" 
          field_type="checkbox" 
          data_type="checkbox" 
          format="integer"
          @change="(name,valid,val) => {
            handleChange(name,valid,val,'catalogue')
          }"
        ></InputField>
      </div>
    </div> 
    <div class="bottom-container">
      <FieldsetButton 
        :buttons="[
          {
            name: 'export',
            icon: 'outbox',
            label_fr: isLoading.catalogue?'Téléchargement en cours ...':'Générer le document .pdf',
            label_en: isLoading.catalogue?'Download in progress ...':'Generate .pdf document'
          }
        ]" 
        :disabled="{export:disable.catalogue}"
        :pulse="isLoading.catalogue"
        @button-action="handleButtonAction('catalogue')"
      ></FieldsetButton> 
      <div v-if="errorMessage.catalogue" class="message error">{{ errorMessage.catalogue }}</div>
      <div v-if="successMessage.catalogue" class="message success">{{ successMessage.catalogue }}</div>
    </div>  
  </fieldset>
</template>

<style scoped> 
  fieldset {
    display:flex;
    flex-direction: column;
    align-items: flex-start;
    gap:10px;
    border-radius: 5px;    
    border-color:rgb(154, 154, 238);
    border-width: 1px;
    max-width:500px;
    margin:10px 10px;
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
    display:flex;
    flex-direction: column;
    justify-content: left;
    align-items: left;

  }  
  .status,.media {
    display:flex;
    flex-wrap: wrap;
    justify-content: left;
    padding:0 10px;
    column-gap:10px;
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