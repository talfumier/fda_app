<script setup>
  import {ref,watch,computed} from 'vue'
  import { useQuasar } from 'quasar'
  import { useI18n } from 'vue-i18n'
  import _ from 'lodash'
  import FieldsetStandard from './FieldsetStandard.vue'
  import FieldsetAddress from './FieldsetAddress.vue'
  import FieldsetTranslate from './FieldsetTranslate.vue'
  import FieldsetButton from './FieldsetButton.vue'
  import DialogInfo from '../../DialogInfo.vue'
  import FieldsetFile from './FieldsetFile.vue'
  import FieldsetFiles from './FieldsetFiles.vue'
  import FieldsetBookingOeuvre from './FieldsetBookingOeuvre.vue'
  import FieldsetDomainTechMedia from './FieldsetDomainTechMedia.vue'
  import FieldsetPrize from './FieldsetPrize.vue'
  import ExpoMaster from './tabs/expo/ExpoMaster.vue'
  import ExpoAward from './tabs/expo/ExpoAward.vue'
  import { getRandomInt } from '@/utilityFunctions.js'
  import { confirm } from '../../dialog/dialog.js'

  const props=defineProps({
    entity:{type:Object},
    fieldsets:{type:Array},
    record:{type:Object}
  }) 
    
  const {t,locale}=useI18n()  
  const $q=useQuasar()

  const tabUnsaved=ref(false)
  const _tab=ref('default')
  const tab = computed({
    get: () => _tab.value,
    set: async(val) => {
      if (tabUnsaved.value && !(await confirm($q,t('common.unsaved'),'cancel'))) return 
      _tab.value = val
      tabUnsaved.value=false
    }
  })
  const filteredFieldsets=computed(() => {
    return _.filter(props.fieldsets,(item) => {
      if(item.type==='button-bottom' || !props.record) return false
      else return item.roles?item.roles.includes(props.record.idRole):true
    })
  })
  const emit=defineEmits(['hideToolbar','change','translate','buttonAction','deleteRow','tabUnsaved'])
  watch(    //watch tab value to hide main toolbar when active tab is no longer on default
    () => tab.value,              // <-- getter function required for primitive value
    (v) => { 
      emit('hideToolbar',v==='default'?false:true) 
    },
    { immediate: false }
  )
  function handleChange(name,valid,val,option){ 
    emit('change',name,valid,val,option)
  }
  function handleTranslate(params) {
    emit('translate',params)
  }
  function handleButtonAction(name){
    emit('buttonAction',name)
    }
  function getUniqueKey(){
    let x=null
    Object.keys(props.record).map((key) => {
      if(key.includes('id')) x+=props.record[key]
    })
    return x
  }
</script>

<template>
  <slot name="toolbar"></slot>
  <q-card v-if="entity.detailsTabs">
    <q-tabs
      v-model="tab"
      dense
      class='text-grey'
      active-color='primary'
      indicator-color='primary'
      narrow-indicator
    >
      <q-tab v-for="(item) in entity.detailsTabs" :name="item.name" :label="$t(item.label)" />
    </q-tabs>
  </q-card>
  <q-tab-panels v-model="tab" :class="entity.detailsTabs?'offset':''" animated>
    <q-tab-panel name='default' >
      <fieldset :class="[item.type,item.name]" v-for="(item,idx) in filteredFieldsets" >
        <legend > 
            {{ item[`legend_${locale}`] }}<DialogInfo v-if="item.info" :path="item.info_path" :color="item.info_color"></DialogInfo>
        </legend>
        <FieldsetStandard
          v-if="item.type==='standard'"
          :key="getUniqueKey()"
          :fields="item.fields"
          :data="record"
          @change="handleChange"
        >
        </FieldsetStandard>    
        <FieldsetAddress
          v-if="item.type==='address'"
          :key="idx"
          :fields="item.fields"
          :data="record"
          @change="(name,valid,val) => {
            handleChange(name,valid,val)
          }"
        >
        </FieldsetAddress>      
        <FieldsetTranslate
          v-if="item.type==='translate'"
          :key="idx"
          :fields="item.fields"
          :data="record"
          @change="(name,valid,val) => {
            handleChange(name,valid,val)
          }"
          @translate="(params) => {
            handleTranslate(params)
          }"
        >
        </FieldsetTranslate>
        <!-- file change monitoring not required for FieldsetFile >>> toolbar save is not involved in upload & delete operations -->
        <FieldsetFile   
          v-if="item.type==='single-upload'"          
          :key="getRandomInt(100,3e3)"
          :fileYes="entity.fileYes"
          :model="entity.model"
          :fields="item.fields"
          :data="record"
        >
        </FieldsetFile>
        <FieldsetFiles
          v-if="item.type==='multiple-upload'"          
          :key="getRandomInt(1e3,3e5)"
          :fileYes="entity.fileYes"
          :model="entity.model"
          :fields="item.fields"
          :count="item.count"
          :data="record"
        >
        </FieldsetFiles>
        <FieldsetDomainTechMedia
          v-if="item.type==='domain-tech-media'"
          :data="[record.domain,record.tech,record.media]"
          @change="handleChange"
          @delete-row="(model,id) => {
            emit('deleteRow',model,id)
          }"
        >
        </FieldsetDomainTechMedia>
        <FieldsetPrize
          v-if="item.type==='prize'"
          :data="record.prize"
          @change="handleChange"
          @delete-row="(model,id) => {
            emit('deleteRow',model,id)
          }"          
        ></FieldsetPrize>
        <FieldsetBookingOeuvre
          v-if="item.type==='booking-oeuvre'"  
          :data="record"
          @change="(name,valid,val) => {
            handleChange(name,valid,val)
          }"
        >
        </FieldsetBookingOeuvre>
        <FieldsetButton  
          v-if="item.type==='button'"
          :buttons="item.buttons"  
          @button-action="handleButtonAction"      
        >
        </FieldsetButton>
      </fieldset>
    </q-tab-panel>
    <q-tab-panel v-if="entity.model==='Expo'" name='guest' >
      <ExpoMaster
        entity='UserExpoRole'
        :idExpo="record.idExpo"
        :relatedFields="['idUser','idRole']"
        :idRole="2"
        sql='list_expo_guest'
        :columns="[
          {name:'selected',field:'selected',align:'left'},
          {name:'idUser',field:'idUser',align:'left'},
          {name:'idRole',field:'idRole',align:'left'},
          {name:'lastName',field:'lastName',headerClasses: 'col-name'},
          {name:'firstName',field:'firstName',headerClasses: 'col-name'},
          {name:'url',field:'url'}]"
        :visible="['selected','lastName','firstName','url']"
        :titles="[
          $t('comps.form_details.expos.tables.guest-left.title'),
          $t('comps.form_details.expos.tables.guest-right.title')]"
        @tab-unsaved="(val) => {
          tabUnsaved=val
          emit('tabUnsaved',val)
        }"
      >
      </ExpoMaster>
    </q-tab-panel>
    <q-tab-panel v-if="entity.model==='Expo'" name='jury' >
      <ExpoMaster
        entity='UserExpoRole'
        :idExpo="record.idExpo"
        :relatedFields="['idUser','idRole']"
        :idRole="4"
        sql='list_expo_jury'
        :columns="[
          {name:'selected',field:'selected',align:'left'},
          {name:'idUser',field:'idUser',align:'left'},
          {name:'idRole',field:'idRole',align:'left'},
          {name:'lastName',field:'lastName',headerClasses: 'col-name'},
          {name:'firstName',field:'firstName',headerClasses: 'col-name'},
          {name:'url',field:'url'}]"
        :visible="['selected','lastName','firstName','url']"
        :titles="[
          $t('comps.form_details.expos.tables.jury-left.title'),
          $t('comps.form_details.expos.tables.jury-right.title')]"
        @tab-unsaved="(val) => {
          tabUnsaved=val
          emit('tabUnsaved',val)
        }"
      >
      </ExpoMaster>
    </q-tab-panel>
    <q-tab-panel v-if="entity.model==='Expo'" name='partner'>
      <ExpoMaster
        entity='ExpoPartner'
        :idExpo="record.idExpo"
        :relatedFields="['idPartner']"
        sql='list_expo_partner'
        :columns="[
          {name:'selected',field:'selected',align:'left'},
          {name:'idPartner',field:'idPartner',align:'left'},
          {name:'name',field:'name',headerClasses: 'col-name'},
          {name:'url',field:'url'}]"
        :visible="['selected','name','url']"
        :titles="[
          $t('comps.form_details.expos.tables.partner-left.title'),
          $t('comps.form_details.expos.tables.partner-right.title')]"
        @tab-unsaved="(val) => {
          tabUnsaved=val
          emit('tabUnsaved',val)
        }"
      >
      </ExpoMaster>
    </q-tab-panel>
    <q-tab-panel v-if="entity.model==='Expo'" name='award' >
      <ExpoAward
        entity='ExpoPrizeUser'
        :idExpo="record.idExpo"
        :relatedFields="['idUser','idPrize','applicable']"
        sql='list_expo_prize_user'
        :columns="[
          {name:'selected',field:'selected',align:'left'},
          {name:'idPrize',field:'idPrize',align:'left'},
          {name:'idExpo',field:'idExpo',align:'left'},
          {name:`prize_${locale}`,field:'name'},
          {name:'applicable',field:'idUser',align:'left'},
          {name:'idUser',field:'idUser',align:'left'}]"
        :visible="['selected',`prize_${locale}`,'applicable','idUser']"
        @tab-unsaved="(val) => {
          tabUnsaved=val
          emit('tabUnsaved',val)
        }"
      >
      </ExpoAward>
    </q-tab-panel>
    <q-tab-panel v-if="entity.model==='Expo'" name='doc'>
      <ExpoMaster
        entity='ExpoDoc'
        :idExpo="record.idExpo"
        :relatedFields="['idDoc']"
        sql='list_expo_doc'
        :columns="[
          {name:'selected',field:'selected',align:'left'},
          {name:'idDoc',field:'idDoc',align:'left'},
          {name:'short',field:'short',headerClasses: 'col-name'},
          {name:'fileName',field:'fileName'}]"
        :visible="['selected','short']"
        :titles="[
          $t('comps.form_details.expos.tables.doc-left.title'),
          $t('comps.form_details.expos.tables.doc-right.title')]"
        @tab-unsaved="(val) => {
          tabUnsaved=val
          emit('tabUnsaved',val)
        }"
      >
      </ExpoMaster>
    </q-tab-panel>
  </q-tab-panels>
</template>

<style scoped>
  .q-card {
    position:absolute;
    top:0;
    z-index:1000;
    width:100%;   
  }
  ::v-deep( div.q-tabs__content) {
    justify-content: left;
  }
  /* ::v-deep( div.q-tabs__row) {
    margin-right:50px;
  } */
  .q-tab-panels {
    padding:0 10px 20px;
  }
  .q-tab-panel {
    padding:0px 5px;
    height:100%;
    overflow-y: auto;
    width:100%;
  }
  .q-tab-panels.offset .q-tab-panel {
    padding-top:40px;
  }
  fieldset {
    display:flex;
    flex-wrap: wrap;
    gap:10px;
    margin-top:5px;
    padding:0 10px 5px;
    border-radius: 5px;    
    border-color:rgb(154, 154, 238);
    border-width: 1px;
  }
  fieldset.public {
    justify-content: space-around;
  }
  fieldset.account {
    justify-content: space-around;
    align-items: center;
  }
  fieldset.links {
    justify-content: space-around;
  }
  fieldset.domain_tech_media {
    gap:30px;
  }
  fieldset.price {
    gap:60px;
  }
  fieldset.events {
    flex-direction: column;
    gap:0px;
  }
  fieldset:has(.button) {
    justify-content:center;
    align-items: top;
    border-width: 0;
    padding:10px 0;
  }
  fieldset.unknown {
    display:none;
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
  @media screen and (min-width: 1546px) {
    fieldset.events {
      flex-direction: row;      
    }
  } 
</style>