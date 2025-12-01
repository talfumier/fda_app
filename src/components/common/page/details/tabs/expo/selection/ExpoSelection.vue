<script setup>
  import {ref,computed,inject,onMounted,onUnmounted} from 'vue'
  import { useI18n } from 'vue-i18n'
  import _ from 'lodash'
  import { getEntitiesBySql } from '@/services/httpEntities.js'
  import { postEntity,patchEntity } from '@/services/httpEntities.js'
  import { newController,doneController,cancelAllInFlight } from '@/utilityFunctions.js'
  import MasterTable from './MasterTable.vue'
  import FileViewerModal from '../../../FileViewerModal.vue'
  import { getFileExtension } from '@/utilityFunctions.js'
  import Tooltip from '@/components/common/Tooltip.vue'
  import SelectionActions from './SelectionActions.vue'
  import BookingInfos from '@/components/common/page/list/actions/booking/BookingInfos.vue'

  const props=defineProps({    
    idExpo:{type:Number}
  })

  const {t,locale}=useI18n()
  const {token}=inject('userCookie')  
  const inFlight=new Set()
  
  const state=ref([])
  const columns=computed(() => {
    if(!state) return []
    const arr=[{name:'selected',field:'selected'}]
    Object.keys(state.value[0][0]).forEach((key) => {
      arr.push({name:key,field:key})
    })
    return arr
  })
  
  const fields={
    booking:['idBooking','idUser','idRole','artist','u_url','u_fileName','idStatus_b','priceShowRoom','priceScreen'],
    bookingOeuvres:['idBookingOeuvre','idOeuvre','selected','showRoom','screen','idStatus_bo',
      'classic_modern','idDomain','domain_fr','domain_en','tech_fr','tech_en','media_fr','media_en',
      'width','height','depth','weight','title_fr','title_en','o_url','o_fileName','showRoom','screen']
  }
  function getGroup(row){
    const group={}
    fields.booking.map((field) => {
      group[field]=row[field]      
    })
    group.selected=false
    group.showRoom=0
    group.screen=0
    group.price=0
    group.bookingOeuvres=[]
    return group
  }
  function getItem(row){
    const item={}
    fields.bookingOeuvres.map((field) => {
      item[field]=row[field]
    })
    return item
  }
  async function fetch(signal){
    const {data:res}=await getEntitiesBySql(
      'list_booking_selection',
      token.value,
      signal,
      ':idExpo',
      props.idExpo
    )
    if(res.statusCode===200) return res.data
  }
  function updateTotals(id=null){  //totals element {showRoom:...,screen: ....} in table body (booking-oeuvre row)
    let showRoom=null,screen=null,price=null,flg=null //showRoom flag   
    state.value[0].forEach((row) => {
      if(id && row.idBooking!==id) return
      flg=false,showRoom=0,screen=0,price=0
      row.bookingOeuvres.forEach((bo) => {
        showRoom+=(bo.showRoom===1 && bo.idStatus_bo===17)?1:0
        screen+=(bo.screen===1 && bo.idStatus_bo===17)?1:0
        if(!flg && bo.showRoom===1 && bo.idStatus_bo===17 && row.idRole!==2){
          flg=true
          price+=row.priceShowRoom
        }
        if(bo.screen===1 && bo.idStatus_bo===17) price+=row.priceScreen
      })
      row.showRoom=showRoom,row.screen=screen,row.price=price
    })
    return price
  }
  function updateSynthesis(){
    const totals={15:{showRoom:0,screen:0},16:{showRoom:0,screen:0},17:{showRoom:0,screen:0}}
    state.value[6]=_.cloneDeep(domain)  //initialise to {showRoom:0, screen:0}
    state.value[0].forEach((row) => {
      row.bookingOeuvres.forEach((bo) => {
        totals[bo.idStatus_bo].showRoom= totals[bo.idStatus_bo].showRoom+=bo.showRoom===1?1:0
        totals[bo.idStatus_bo].screen= totals[bo.idStatus_bo].screen+=bo.screen===1?1:0
        state.value[6][bo.idDomain][bo.idStatus_bo].showRoom+=bo.showRoom
        state.value[6][bo.idDomain][bo.idStatus_bo].screen+=bo.screen
      })      
    })
    return totals
  }
  let domain=null
  onMounted(async () => {  
    const ctrl=newController(inFlight)
    try {
      state.value = await fetch(ctrl.signal) 
      const groupsById = {}   
      let flg=null //showRoom flag   
      state.value[0].forEach(row => {
        const id = row.idBooking
        if (!groupsById[id]) {     
          flg=false    
          groupsById[id] = getGroup(row)
        }
        const item=getItem(row)
        groupsById[id].bookingOeuvres.push(item)        
      })
      state.value[0]=Object.values(groupsById)
      updateTotals() 
          //Initialize synthesis
      let obj={0:0,8:0,9:0,10:0,27:0}  //0:>>> total, other properties are booking idStatus
      state.value[3].forEach((bkg) => {
        obj['0']+=1
        obj[bkg.idStatus]+=1
      })
      state.value[3]=obj
      const status={} 
      state.value[5].forEach((s) => {
        status[s.idStatus]={showRoom:0,screen:0}
      })
      domain={}  //TBD domain (idDomain is missing in a given oeuvre) >>> fake idStatus=300
      state.value[6].forEach((d) => {
        domain[d.idDomain]=_.cloneDeep(status)
      })
      obj={}
      state.value[6].forEach((o) => {
        domain[o.idDomain][o.idStatus].showRoom=0 
        domain[o.idDomain][o.idStatus].screen=0
        obj[o.idDomain]={fr:o.domain_fr,en:o.domain_en}
      })
      state.value[6]=domain
      state.value[4]=obj
      state.value.push(updateSynthesis())
    } catch (error) {
      console.error('onmounted failed in ExpoSelection.vue', error)
      return
    }
    finally {
      doneController(ctrl,inFlight)
    }
  })
  onUnmounted(() => { // clean-up code after component has unmounted  
    cancelAllInFlight(inFlight)
  }) 
  //FILE VIEWER
  const file=ref(null)
  const isOpen = ref(false)
  function openModal(cs,row) {
    file.value={url:row[`${cs}_url`],name:row[`${cs}_fileName`],ext:getFileExtension(row[`${cs}_fileName`])}
    isOpen.value = true
  }
  function closeModal() {
    isOpen.value = false
  }
  // TOOLBAR ACTIONS HANDLING
  async function handleActions(cs,bookingID){
    let status=10 //accept
    switch(cs){
      case 'reject':
        status=9
        break
      case 'payment':
        status=27
    }
    const ctrl=newController(inFlight)
    try {
      const res=await postEntity('StatusTracking', {idStatus:status,idBooking:bookingID}, token.value, ctrl.signal) 
      if(res.data.statusCode!==200) return   
      const idx=state.value[0].findIndex((row) => {   //update state
        return row.idBooking===bookingID
      })
      const oldStatus=state.value[0][idx].idStatus_b    
      state.value[0][idx].idStatus_b=status
      state.value[1].unshift({idBooking:bookingID,idStatus:status,createdAt:new Date()})
      state.value[3][oldStatus]+=-1   //update top level synthesis
      state.value[3][status]+=1             
    } catch (error) {
        console.error(error)
    }
    finally {
      doneController(ctrl,inFlight)
    } 
  }
  //BOOKING-OEUVRE STATUS HANDLING
  async function updateBoStatus(statusID,bookingID,boID){
    const ctrl=newController(inFlight)
    try {
      const {data:res1}=await postEntity('StatusTracking', {idStatus:statusID,idBookingOeuvre:boID}, token.value, ctrl.signal) 
      if(res1.statusCode!==200) return   
      const price=updateTotals(bookingID)
      const {data:res2}=await patchEntity('Booking',bookingID,{price},token.value,ctrl.signal)
      if(res2.statusCode!==200) return   
      state[7]=updateSynthesis()             
    } catch (error) {
        console.error(error)
    }
    finally {
      doneController(ctrl,inFlight)
    } 
  }

  const getBookingOeuvreToggleLabel = (idStatus)=>{
    switch(idStatus){
      case 16:
        return t('comps.list_items.actions_menu.booking.rejected') 
      case 17:
        return t('comps.list_items.actions_menu.booking.accepted')
      default:
        return t('comps.list_items.actions_menu.booking.candidate')
    }
  }
  function getBookingColor(key){
    switch(key){
      case '8':
        return 'warning'
      case '9':
        return 'negative'
      case '10':
        return 'positive'
      case '27':
        const guest=_.filter(state.value[0],(row) => {
          return row.idStatus_b===10 && row.idRole===2
        })
        if((state.value[3]['10']===guest.length)) return 'positive'
        else return 'warning'
      default:
        return 'info'
    }
  }
  const filter=ref({search:'',status1:'',status2:''}) //status1 >>> idStatus 8, 9, 10 - status2 >>> idStatus 27
  const filtered=computed(() => {  
    return _.filter(state.value[0],(item) => {
      let cond=[],result=true
      cond.push(JSON.stringify(item).toLowerCase().includes(filter.value.search.toLowerCase()))
      cond.push(filter.value.status1?item.idStatus_b==9 || item.idStatus_b==10:
        (filter.value.status1===false?item.idStatus_b==8:item.idStatus_b>=8))        
      cond.push(filter.value.status2?item.idStatus_b==27:
        (filter.value.status2===false?item.idStatus_b<27:item.idStatus_b>=8))
      cond.map((cnd) => {
        result=result && cnd
      })
      return result
    })
  })
  const toggleOn = ref({status1:false,status2:false})
  const getFilterToggleLabel = (toggle)=>{
    switch(filter.value[toggle]){
      case true:
        toggleOn.value[toggle]=true
        return t(`comps.form_details.expos.tables.selection.filters.${toggle}.on`) 
      case false:
        toggleOn.value[toggle]=false
        return t(`comps.form_details.expos.tables.selection.filters.${toggle}.off`)
      default:
        return t(`comps.form_details.expos.tables.selection.filters.${toggle}.indeterminate`)
    }
  }

</script>

<template>
  <FileViewerModal 
    v-if="isOpen"
    :file="file"
    @close-modal="closeModal"
  >
  </FileViewerModal> 
  <div class="container">
    <MasterTable v-if="state.length>0"
      class='selection'
      :data="filtered"
      :columns="columns"
      :visible="[]"
      rowKey="idBooking"
    >
      <template v-slot:top>
        <div class="header">
          <div class="synthesis booking">
            <div class="col-header booking-title">{{ $t('comps.form_details.expos.tables.selection.synthesis.booking_row_header') }}</div>
            <div class="col-header">Total</div>
            <div class="col-header" v-for="status in state[2]">{{ _.capitalize(status[`title_${locale}`] )}}</div>
            <div v-for="key in Object.keys(state[3])" :class="[getBookingColor(key)]">
              {{state[3][key]}}
            </div>
          </div>
          <div class="synthesis oeuvre">
            <div class="col-header">{{ $t('comps.form_details.expos.tables.selection.synthesis.domain') }}</div>
            <div v-for="status in state[5]" class="col-header">
              <div class="title">
                <q-badge  :color="status.idStatus===15?'warning':(status.idStatus===16?'negative':'positive')" :label="state[7][status.idStatus].showRoom" />
                {{ _.capitalize(status[`title_${locale}`] )}}
                <q-badge :color="status.idStatus===15?'warning':(status.idStatus===16?'negative':'positive')" :label="state[7][status.idStatus].screen" />              
              </div>
              <div class="show-screen">
                <p>{{$t('comps.form_details.booking_oeuvre.showRoom')}}</p>
                <p>{{$t('comps.form_details.booking_oeuvre.screen')}}</p>
              </div>
            </div>  
            <div class="data-row" v-for="(key,idx) in Object.keys(state[6])">
              <div class="row-header">{{ state[4][key][locale] }}</div>
              <div class="data-cell "v-for="ky in Object.keys(state[6][key])">
                <p>{{state[6][key][ky].showRoom}}</p><p>{{state[6][key][ky].screen}}</p>
              </div>
            </div>      
          </div>
        </div>
        <div class='filters' >
          <q-input
            dense
            filled
            debounce="300"
            v-model="filter.search"
            :placeholder="$t('common.search')"
            hide-bottom-space
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
            <template v-slot:append>
              <q-icon name="cancel" @click="filter.search=''" class="cursor-pointer" />
            </template>
          </q-input> 
          <div class="toggle"> 
            <q-toggle
              v-model="filter.status1"
              toggle-indeterminate
              :label="getFilterToggleLabel('status1')"            
              :color="toggleOn.status1?'positive':'deep-orange-9'"
              keep-color
              checked-icon="check"
              unchecked-icon="check"
              size="md"
            />   
            <q-toggle
              v-model="filter.status2"
              toggle-indeterminate
              :label="getFilterToggleLabel('status2')"
              :color="toggleOn.status2?'positive':'deep-orange-9'"
              keep-color
              checked-icon="check"
              unchecked-icon="check"
              size="md"
            />  
          </div>        
          <q-badge class='nbr-filtered':label="`${filtered.length}/${state[0].length}`"></q-badge>
        </div> 
      </template> 
      <template #artist="slotProps">
        <div :key="slotProps.row.idBooking" class="artist"> 
          <q-img :src="slotProps.row.u_url" @click="openModal('u',slotProps.row)"
          >
            <Tooltip :tt_text="$t('comps.form_details.expos.tables.selection.tt_oeuvre')"></Tooltip>  
          </q-img> 
          <div class="name-icon">
            <p class="artist">
              {{slotProps.row.artist }}
            </p>
            <q-icon 
              name="done_all" :color="slotProps.row.idStatus_b===27?'positive':'warning'" size="2.5rem">
            </q-icon>
          </div>
        </div>
      </template> 
      <template #infos="slotProps">
        <p class="infos">
          <BookingInfos
            :data="_.filter(state[1],(info) => {
              return info.idBooking==slotProps.row.idBooking
            })"
          >
          </BookingInfos>  
        </p>
      </template>
      <template #actions="slotProps">
        <p class="actions">
          <SelectionActions v-if="slotProps.row.selected"
            :data="slotProps.row"
            @selection-action="(cs) => {
              handleActions(cs,slotProps.row.idBooking)
            }"
          >
          </SelectionActions>
        </p>  
      </template>
      <template #body="slotProps"> 
        <q-td :class="[slotProps.rowIndex===0?'first':'']">
          <div class="show-price">
            <q-badge  v-if="slotProps.row.idRole===2" color='positive' class='guest' :label="$t('comps.form_details.expos.tabs.guest')" /> 
            <p class="total"><span>{{$t('comps.form_details.expos.tables.selection.show-price.room')}}:&nbsp;</span><span>{{ slotProps.row.showRoom }}</span></p>          
            <p class="total"><span>{{$t('comps.form_details.expos.tables.selection.show-price.screen')}}:&nbsp;</span><span>{{ slotProps.row.screen }}</span></p>        
            <p v-if="slotProps.row.idRole!==2" class="total">
              <span>{{$t('comps.form_details.expos.tables.selection.show-price.price')}}:&nbsp;</span><span>€&nbsp;{{ slotProps.row.price }}</span>
            </p>
          </div>
        </q-td>
        <q-td :class="[slotProps.rowIndex===0?'first':'']">
          <div v-for="(bo,idx) in slotProps.row.bookingOeuvres" 
            :key="bo.idBookingOeuvre"
            class="booking-oeuvre"
          >
            <p class="title">{{ bo[`title_${locale}`]}}</p>
            <q-img class="oeuvre" :src="bo.o_url"
              @click="openModal('o',bo)"
            >
              <Tooltip :tt_text=" $t('comps.form_details.expos.tables.selection.tt_oeuvre')"></Tooltip>  
            </q-img> 
            <div class="style-dtm">
              <p>{{ $t(`comps.form_details.expos.tables.selection.${bo.classic_modern===1?'classic':'modern'}`) }}</p>
              <p>{{ bo[`domain_${locale}`] }}</p>
              <p>{{ bo[`tech_${locale}`] }}</p>
              <p>{{ bo[`media_${locale}`] }}</p>
            </div>
            <div class="dim">
              <p>{{$t('comps.form_details.expos.tables.selection.dim.h')}}:&nbsp;{{ bo.width }}&nbsp;cm</p>
              <p>{{$t('comps.form_details.expos.tables.selection.dim.w')}}:&nbsp;{{ bo.height }}&nbsp;cm</p>
              <p v-if="bo.depth">{{$t('comps.form_details.expos.tables.selection.dim.d')}}:&nbsp;{{ bo.depth }}&nbsp;cm</p>
              <p v-if="bo.weight">{{$t('comps.form_details.expos.tables.selection.dim.wt')}}:&nbsp;{{ bo.weight }}&nbsp;Kg</p>
            </div>
            <div class="show">
              <q-checkbox v-model="bo.showRoom" :true-value="1" :false-value="0" size="sm" dense 
                :label="$t('comps.form_details.expos.tables.selection.show-price.room')" 
                disable
              />    
              <q-checkbox v-model="bo.screen" :true-value="1" :false-value="0" size="sm" dense 
                :label="$t('comps.form_details.expos.tables.selection.show-price.screen')" 
                disable
              />    
            </div>
            <div class="status">
              <q-toggle
                v-model="bo.idStatus_bo"
                toggle-indeterminate
                :label="getBookingOeuvreToggleLabel(bo.idStatus_bo)"    
                :true-value="17"
                :false-value="16"
                :indeterminate-value="15"        
                :color="bo.idStatus_bo===17?'positive':'deep-orange-9'"
                keep-color
                checked-icon="check"
                unchecked-icon="clear"
                size="md"
                :disable="!slotProps.row.selected"
                @update:model-value="(val) => {
                  updateBoStatus(val,slotProps.row.idBooking,bo.idBookingOeuvre)
                }"
              />   
            </div>
            <hr v-if="idx!==slotProps.row.bookingOeuvres.length-1">
          </div>
        </q-td>
      </template>
    </MasterTable> 
  </div>
</template>

<style scoped>
  div.container {
    display:flex;
    justify-content:left;
    margin-top: 20px;
    padding: 0 0 10px;
  }
  /* TABLE TOP AREA */
  ::v-deep(div.q-table__top) {
    padding:0;
  }
  div.header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin:5px auto;
    width:100%;
  }
  div.synthesis {
    display:grid;
    border-right: 1px solid var(--blue); 
    border-bottom: 1px solid var(--blue);  
    margin:5px 0;  
  }
  div.synthesis.booking {
    grid-template-rows: auto;
    grid-template-columns: 110px repeat(4,80px) 130px;
  }
  div.col-header.booking-title {
    grid-column: 1;
    grid-row: 1/span 2;
  }
  div.synthesis.booking div {
    display:flex;
    justify-content: center;
    border-top: 1px solid var(--blue);    
    border-left: 1px solid var(--blue);
    padding:2px;
    font-weight: bolder;
  }
  div.info {
    color:blue;
  }
  div.warning {
    color:orange;
  }
  div.negative {
    color:red;
  }
  div.positive {
    color:green;
  }
  div.synthesis.oeuvre {
    grid-template-rows: auto;
    grid-template-columns: 80px repeat(3,auto);  
    border: 1px solid var(--blue);
  }
  div.row-header {
    border-top: 1px solid var(--blue);  
    padding:0 5px;  
  }
  div.col-header {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-style: italic;
    font-weight: bolder;
    color:var(--black-opaque8);
  }
  div.col-header .title {  
    display:flex;
    justify-content: space-between;     
    border-left: 1px solid var(--blue);
    width:100%;
    padding:0 5px;
  }  
  .q-badge {
    height:15px;
    width:25px;
    margin-top: 2px;
    display:flex;
    justify-content: center;        
  }
  div.show-screen {
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-evenly; 
    border-top: 1px solid var(--blue); 
  }
  div.show-screen p {   
    border-left: 1px solid var(--blue);
    text-align: center;
    width:90px;
  }
  div.data-row {
    display: contents;    /* exluded from grid flow */
  }
  div.data-cell {
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-evenly; 
    border-top: 1px solid var(--blue); 
    border-left: 1px solid var(--blue);
  }
  /* TABLE FILTERS */
  div.filters {
    display:flex;
    justify-content: left;
    align-items: center;
    padding:5px 10px;  
    width:100%;
    border-top: 1px solid var(--blue); 
  }
  .q-badge.nbr-filtered {
    text-align: center;
    background-color: blue;
    padding:10px 15px;
    margin-left: 25px;
  }
  /* TABLE BODY */
  .q-td.first {
    border-top: none;
  }
  .q-td:has(div.artist,div.show-price) {
    border-right: 1px solid var(--blue);
  }
 .q-img {
    height: 35px;
    width: 35px;
    object-fit: cover;
    margin:5px;
    cursor: pointer;
  }
  p {    
    font-size: 1.5rem; 
  }
  div.artist {
    display:flex;
    flex-wrap: nowrap;
    align-items:center;
    font-weight: bolder;
  }  
  div.name-icon {
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-between;
    align-items: center;
  }
  div.artist .q-icon {
    padding: 0 5px;
  }
  p.infos,p.actions {
    display: flex;
    justify-content: center;
    font-weight: bolder;
  }  
  div.show-price {
    display:flex;
    flex-direction: column;
    align-items:flex-start;  

  }
  div.show-price .q-badge {
    align-self: center;
    height:fit-content;
    padding:3px 0;
    min-height: 20px;
    min-width:80px;
    white-space: normal;
    text-align: center;
    margin-bottom: 20px;
  }
  p.total {
    display:flex;
    justify-content: space-between;
    padding:0 10px;
  }
  ::v-deep(td.q-td){
    border-top:1px solid var(--blue);
    padding:0;
  }
  div.booking-oeuvre {
    display:grid;
    grid-template-rows: auto;
    grid-template-columns: 150px 45px 350px 200px 100px 120px;
    justify-content: left;
    align-items: center;
  }
  p {    
    margin:0;
    padding:0 5px;
  }
  p.title {
    grid-row: 1;
    grid-column: 1;
    white-space: pre-wrap;
  }
  .q-img.oeuvre {
    grid-row: 1;
    grid-column: 2;
  }
  div.style-dtm, div.dim {
    display:flex;
    flex-wrap: wrap;
    justify-content: left;
    gap:5px;
    padding:5px;
  }
  div.style-dtm {
    grid-row: 1;
    grid-column: 3;
  }
  div.dim {
    grid-row: 1;
    grid-column: 4;
  }
  div.style-dtm p, div.dim p {
    border:1px solid ;
    border-radius: 5px;
  }
  div.show {
    display:flex;
    flex-direction: column;
    align-items: flex-start;
    grid-row: 1;
    grid-column: 5;
  }
  div.booking-oeuvre hr {
    grid-row: -1;
    grid-column: 1/-1;
    display: block;
    width:100%;
    margin:0;
    border: none;
    border-top:1px solid var(--blue);
  }

</style>