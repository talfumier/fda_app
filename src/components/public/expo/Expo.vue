<script setup>
  import {computed,ref,onMounted,onUnmounted} from 'vue'
  import { useRoute } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import _ from 'lodash'
  import allTabs from './tabs.json'
  import { newController,doneController,cancelAllInFlight, getFileExtension } from '@/utilityFunctions.js'
  import { fetch } from '../functions.js'
  import { useFormatDate } from '@/composable/useFormatDate.js'
  import FileViewer from '@/components/common/page/details/FileViewer.vue'
  import supported from '../../common/page/details/supported.json'
  import Carousel from './Carousel.vue'
  import Guest from './Guest.vue'
  import Partner from './Partner.vue'
  import NotYet from '@/components/general/NotYetDev.vue'
  import { getExpoDoc } from '@/components/common/page/details/tabs/expo/expoFunctions.js'
import JuryAwards from './JuryAwards.vue';

  const props=defineProps({
    idExpo:{type:String}
  })
  
  const inFlight=new Set()

  const route=useRoute()
  const idStatus=computed(() => {
    return parseInt(route.query.idStatus)
  })
  const {locale}=useI18n()   
  const {formatDateTime}=useFormatDate()  

  const _tab=ref('default')
  const tab = computed({
    get: () => _tab.value,
    set: async(val) => {
      _tab.value = val
    }
  })
  const tabs=computed(() => {
    const idx=idStatus.value===12?0:1
    return allTabs
      .filter(tab => tab.idStatus.includes(idStatus.value))
      .sort((a, b) => a.order[idx] - b.order[idx])
  })

  const state=ref([])  
  const rules=computed(() => {
    return getExpoDoc(state.value,2)
  })
  const catalogDoc=computed(() => {  //catching-up solution
    return getExpoDoc(state.value,4)
  })
  const guestDoc=computed(() => { //catching-up solution
    return getExpoDoc(state.value,11)
  })  
  const awardsDoc=computed(() => { //catching-up solution
    return getExpoDoc(state.value,12)
  })
  onMounted(async () => {  
    const ctrl=newController(inFlight)
    try {
      // state[] >>> 0: expo details, 1: expo images, 2: expo docs, 3: expo partners (info + images), 4:jury/awards, 5: user guest expo role (idRole:2), 6: expo partner
      state.value = await fetch('public_expo_details',ctrl.signal,':idExpo,:idStatus',`${props.idExpo},${idStatus.value}`) 
    } catch (error) {
      console.error('onmounted failed in Expo.vue', error)
      return
    }
    finally {
      doneController(ctrl,inFlight)
    }
  })
  onUnmounted(() => { // clean-up code after component has unmounted  
    cancelAllInFlight(inFlight)
  })  

  const visible=(field) => {
    switch(field.name.slice(-3)){
      case '_fr':
        if(locale.value==='fr') return true
        break
      case '_en':
        if(locale.value==='en') return true
        break
      default:
        return true
    }
    return false
  }
  
</script>

<template>
  <q-card >
    <q-tabs
      v-model="tab"
      dense
      class='text-grey'
      active-color='primary'
      indicator-color='primary'
      narrow-indicator
    >
      <q-tab v-for="(item) in tabs" :name="item.name" :label="$t(item.label)" />
    </q-tabs>
  </q-card>
  <q-tab-panels v-if="state.length>0" v-model="tab" animated>
    <q-tab-panel class='default' name='default' >
      <fieldset v-for="(section) in tabs[0].sections" >
        <legend > 
            {{ section[`legend_${locale}`] }}
        </legend>
          <q-input  v-for="(field) in section.fields"
            type='textarea'
            :class="[visible(field)?'visible':'hidden']"
            readonly
            outlined
            autogrow
            class="no-native"
          >
            <template v-slot:prepend>
              <q-icon v-if="field.icon"  :name="field.icon" color='primary' size="2.8rem"/>
            </template>              
             <template #default>
              <div class="slot-text">
                <p class='label'>{{ field[`label_${locale}`] }}</p>
                <p class='text'>
                  <span v-if="field.name.includes('price')">€</span> 
                  {{field.format==='date-time'?formatDateTime(state[0][0][field.name]):state[0][0][field.name]}}
                </p>
              </div>
            </template>       
        </q-input>
      </fieldset>
    </q-tab-panel>
    <q-tab-panel class='doc' name='rules'>
      <FileViewer v-if="rules"
        :file="rules"
        :fileYes="['msoffice', 'image', 'pdf']"
        :supported="supported"
        size='large'
        height='full'
      ></FileViewer>
    </q-tab-panel>
    <q-tab-panel class='doc' name='catalog'>
      <!-- catching-up solution >>> catalog as a doc-->
      <FileViewer v-if="catalogDoc"  
        :file="catalogDoc"
        :fileYes="['msoffice', 'image', 'pdf']"
        :supported="supported"
        size='large'
        height='full'
      ></FileViewer>
    </q-tab-panel>     
    <q-tab-panel class='photos' name='photos'>
      <Carousel :data="state[1]"></Carousel>
    </q-tab-panel>
    <q-tab-panel class='guest' name='guest' >      
      <!-- catching-up solution >>> guest as a doc-->
      <FileViewer v-if="guestDoc"  
        :file="guestDoc"
        :fileYes="['msoffice', 'image', 'pdf']"
        :supported="supported"
        size='large'
        height='full'
      ></FileViewer>
      <Guest v-if="!guestDoc"
        :data="state[5]"
      >
      </Guest>
    </q-tab-panel>
    <q-tab-panel class='partner' name='partner' >      
      <Partner
        :data="state[6]"
      >
      </Partner>
    </q-tab-panel>
    <q-tab-panel class='jury-award' name='jury-award'>   
      <!-- catching-up solution >>> jury/awards as a doc-->
      <FileViewer v-if="awardsDoc"  
        :file="awardsDoc"
        :fileYes="['msoffice', 'image', 'pdf']"
        :supported="supported"
        size='large'
        height='full'
      ></FileViewer> 
      <JuryAwards v-if="!awardsDoc"
        :data="{jury:state[7],awards:state[8]}"
      >
      </JuryAwards>  
    </q-tab-panel>
  </q-tab-panels>
</template>

<style scoped>
  ::v-deep( div.q-tabs__content) {
    justify-content: left;
  }
  .q-card {
    position:absolute;
    top:0;
    z-index:1000;
    width:100%;   
  }
  .q-tab-panels {
    padding:56px 10px 20px;
    overflow-y:hidden;
    height:100%;
  }
  .q-tab-panel {
    display:grid;
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    align-content: flex-start;
    padding: 0 10px;
  }
  .q-tab-panel.not-yet {
    display:flex;
    justify-content: center;
    align-items: center;
  }
  .q-tab-panel.photos {
    overflow: hidden;
  }
  .q-tab-panel.guest,.q-tab-panel.partner {
    display:flex;
    flex-wrap: wrap;
    justify-content:space-evenly;
    align-items:center;    
    flex: 1 1 auto;
  }
  .q-tab-panel.jury-award {
    display:flex;
    flex-wrap: wrap;
    justify-content:left;
    gap:40px;
  }
  legend {
    font-size:1.9rem;
    line-height: 2.2rem;
    text-wrap: nowrap;
    font-style: italic;
    font-weight:500;
    color:var(--blue);
    padding:10px 10px;
  }
  fieldset {
    display:flex;
    flex-wrap: wrap;
    gap:10px;
    margin-top:5px;
    padding:0 10px 20px;
    border-radius: 5px;    
    border-color:rgb(154, 154, 238);
    border-width: 1px;
  }
  .q-input.visible {
    display:flex;
  }
  .q-input.hidden {
    display:none;
  }
  :deep(.no-native .q-field__native) { 
    display: none; 
  }
  :deep(.slot-text) {
    display:flex;
    flex-direction: column;
    align-items: left;
    justify-content: center;
    white-space: pre-wrap;   /* preserves line breaks */
    word-break: break-word;
    padding:5px 0;
    max-width: 600px;
  }
  p {
    padding:0;
    margin:0;
    text-align: left;
  }
  p.label {
    font-weight: bolder;
    font-size:1.6rem;
  }
  p.text {
    font-size:1.6rem;
    color: var(--black-opaque9);
  }
  @media screen and (min-width: 1000px) {       
    .q-tab-panel:not(.default,.doc,.photos,.guest,.partner,.not-yet) {
      /* display:grid; */
      grid-template-columns: 1fr 1fr;
      column-gap: 20px;
    }
    .q-tab-panel.default {
      grid-template-columns: minmax(auto, 1000px);
    }  
    .q-tab-panel.photos {
      grid-template-columns: 600px;
    }  
  } 

</style>