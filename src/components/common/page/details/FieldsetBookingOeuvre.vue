<script setup>
  import {ref,computed} from 'vue'
  import { useI18n } from 'vue-i18n'
  import _ from 'lodash'
  import Tooltip from '../../Tooltip.vue'
  import { truncate } from '@/utilityFunctions.js'

  const props = defineProps({
    data:{type:Object}
  })
  const {locale,t}=useI18n()  
  const bookingOeuvre=ref(props.data.bookingOeuvre)

  const columns=computed(() => {
    if(!props.data || !props.data.bookingOeuvre) return []
    let keys=[]
    Object.keys(props.data.bookingOeuvre[0]).map((key) => {
      if(key.endsWith('_fr') || key.endsWith('_en')) keys.push(`${key.split('_')[0]}_${locale.value}`)
      else keys.push(key)
    })
    keys=[...new Set(keys)]
    const cols=[]
    let label=null
    keys.map((key) => {
      switch(key){
        case 'showRoom':
        case 'screen':
          label=t(`comps.form_details.booking_oeuvre.${key}`)
          break
        default:
          label=key
      }
      cols.push({name:key,label,field:key,align:'left'})
    })
    return cols
  })  
  const visible=ref([`title_${locale.value}`,'showRoom','screen'])
  const emit = defineEmits(['change'])

  function handleChange(cs,val,id){  
    bookingOeuvre.value.map((bo) => {
      if(bo.idBookingOeuvre===id) {
        switch(cs){
          case 'checkbox':
            if(val===1 && bo.showRoom===0 && bo.screen===0) bo.showRoom=1
            if(val===0) bo.showRoom=bo.screen=0
            break
          case 'showRoom':
            if(val===0 && bo.screen===0 && bo.selected===1) bo.selected=0
            break
          case 'screen':
            if(val===0 && bo.showRoom===0 && bo.selected===1) bo.selected=0
        }
      }
    })
    emit('change','bookingOeuvre',true,bookingOeuvre.value)    
  }

</script>

<template>
  <q-table v-if="data && data.bookingOeuvre"
    :rows="bookingOeuvre"
    :columns="columns"
    row-key="idBookingOeuvre"
    :visible-columns="visible"
    grid
    hide-header
    hide-bottom
  >  
    <template v-slot:item="slotProps">  <!--  'item' scoped slot defines how each record (i.e a row) should look. slotProps represent a single row.-->
      <div
        class="work-container grid-style-transition"
        :style="slotProps.row.selected ? 'transform: scale(0.95);' : ''"
      >
        <q-card bordered flat :class="slotProps.selected ? 'bg-grey-2':''">
          <q-card-section class='title'>
            <q-checkbox 
              v-model="slotProps.row.selected" 
              dense 
              :true-value="1" :false-value="0"
              @update:model-value="(val) => {
                handleChange('checkbox',val,slotProps.row.idBookingOeuvre)
              }"
            >
              <span>{{ truncate(slotProps.row[`title_${locale}`],24) }}</span>              
            </q-checkbox>
            <!-- <Tooltip 
              v-if="!slotProps.row.showRoom && !slotProps.row.screen" 
              :wrap="true"
              :tt_text="$t('comps.form_details.booking_oeuvre.tooltip')">
            </Tooltip>    -->
          </q-card-section>          
          <div v-if="slotProps.row.selected" class="status-container">
            <label>
              <span>
                {{t('comps.form_details.booking_oeuvre.status')}}&nbsp;:&nbsp;
              </span>
              <span :class="[slotProps.row.idStatus===14 || slotProps.row.idStatus===15]?'warning':(slotProps.row.idStatus===16?'negative':'positive')">
                {{slotProps.row[`status_${locale}`]}}
              </span>
            </label>
          </div>
          <q-img
            :src="slotProps.row.url"
            :alt="slotProps.row[`title_${locale}`]"
            ratio="1"
            loading="lazy"
          />
          <q-separator />
          <q-card-section class="toggle">
            <div class="toggle-container">
              <label>{{t('comps.form_details.booking_oeuvre.showRoom')}}</label>
              <q-toggle
                v-model="slotProps.row.showRoom" 
                :true-value="1" :false-value="0"
                :color="slotProps.row.showRoom?'positive':'deep-orange-9'"
                keep-color
                checked-icon="check"
                unchecked-icon="clear"
                size="md"
                @update:model-value="(val) => {
                  handleChange('showRoom',val,slotProps.row.idBookingOeuvre)
                }"
              />  
            </div>
            <div class="toggle-container">
              <label>{{t('comps.form_details.booking_oeuvre.screen')}}</label>
              <q-toggle
                v-model="slotProps.row.screen"
                :true-value="1" :false-value="0"
                :color="slotProps.row.screen?'positive':'deep-orange-9'"
                keep-color
                checked-icon="check"
                unchecked-icon="clear"
                size="md"
                @update:model-value="(val) => {
                  handleChange('screen',val,slotProps.row.idBookingOeuvre)
                }"
              />  
            </div>
          </q-card-section>
        </q-card>
      </div>
    </template>
  </q-table>
</template>

<style scoped>
  .q-table__container {
    padding-bottom: 10px;
  }
  .q-card {
    width:300px;    
    border:1px solid lightgrey;
    border-radius: 15px;
  }
  .title .q-checkbox {
    font-size: 1.7rem;
    font-style: italic;
    color:blue;
  }  
  .status-container {   
    display: flex;
    flex-wrap: nowrap;
    justify-content: center;
    font-size: 1.5rem;
    padding:5px 10px;
    border-top: 1px solid lightgrey;
  }
  span.warning {
    color:var(--orange);
    font-weight: bolder;
  }
  span.negative {
    color:var(--red);
    font-weight: bolder;
  }
  span.positive {
    color:var(--green);
    font-weight: bolder;
  }
  img {
    object-fit:cover;
  }
  .q-card__section.toggle {
    padding:0 0 10px 0;
  }
  .toggle-container {
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-between;
    align-items: center;
    font-size: 1.7rem;
    padding:0 15px;
  }

</style>