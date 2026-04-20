<script setup>
  import {ref,onMounted,onUnmounted} from 'vue'
  import { useRoute } from "vue-router"
  import _ from 'lodash'
  import { fetch } from '../public/functions'
  import { newController,doneController,cancelAllInFlight,getCloudinaryResizedUrl } from '@/utilityFunctions.js'
  import Header from './Header.vue'

  const props=defineProps({
    locale:{type:String,default:'fr'}
  })
  
  const route=useRoute()
  const inFlight = new Set()   
  const state=ref([])

  function getGroup(row){
    const group={}
    group.artist=row.artist
    group.price=row.price
    group.idStatus_b=row.idStatus_b
    group.bookingOeuvres=[]
    group.screen=0
    return group
  }
  onMounted(async () => {  
    const ctrl=newController(inFlight)
    try {
      if(!route.query) return
      state.value = await fetch('export_deposit_collection', ctrl.signal,':idExpo',route.query.idExpo) 
      const groupsById = {}   
      state.value[0].forEach(row => {
        const id = row.idBooking
        if (!groupsById[id]) groupsById[id] = getGroup(row)
        groupsById[id].bookingOeuvres.push({showRoom:row.showRoom,title:row.title_fr,url:getCloudinaryResizedUrl(row.o_url,50,50)})   
        if(row.screen===1) groupsById[id].screen+=1     
      })
      state.value[0]=_.orderBy(Object.values(groupsById), ['artist'], ['asc'])
    } catch (error) {
      console.error('onmounted failed in DepositCollection.vue', error)
      return
    }
    finally {
      doneController(ctrl,inFlight)      
    }
  })
  onUnmounted(() => { // clean-up code after component has unmounted  
    cancelAllInFlight(inFlight)
  })
  const columns=['Artiste','Contribution','Statut','Oeuvres','Dépôt','Retrait']


</script>

<template>
  <Header></Header>
  <table class="main">
    <thead>
      <tr>
        <th v-for="col in columns">{{ col}}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in state[0]"> 
        <td class="artist"><strong>{{ row.artist }}</strong></td>
        <td class="price">{{ row.price }} €</td>
        <td class="idStatus_b" :style="`color:${row.idStatus_b===27?'green':'red'}`">
          {{ row.price>0?(row.idStatus_b===27?'Paiement reçu':'Paiement non reçu'):'' }}
        </td>
        <td >
          <table>
            <tr v-for="bo in row.bookingOeuvres">
              <td v-if="bo.showRoom==1" class="art-work"><img class="oeuvre" :src="bo.url"></img>{{ bo.title }}</td>
            </tr> 
            <tr v-if="row.screen>0" class="screen">
              <div class="screen">{{ row.screen }}</div>
              <q-icon  class="screen" name="desktop_windows" size="4rem" color="primary" ></q-icon>
            </tr>
          </table>
        </td>
        <td class="deposit"></td>
        <td class="collection"></td>
      </tr>
    </tbody>
  </table>
  <div class="pdf-footer"></div>
</template>

<style scoped>
  table.main {
    margin:20px;
  }
  /* Repeat table header on every page */
  thead {
    display: table-header-group;  
    background-color: rgb(230, 227, 227);  
  }
  table.main,th,td {
    border: 1px solid black;
    text-align: center;
  }
  th {
    padding:5px 10px;
  }
  td.artist {
    padding:0 10px;
    text-align: left;
  }
  td.idStatus_b {
    font-weight: bolder;
    width:80px;
  }
  td.art-work {
    display:flex;
    flex-wrap: nowrap;
    justify-content: left;
    align-items: center;
    gap:10px;
    padding:5px;
    border: none;
    min-width:100%;
  }
  tr.screen {
    position:relative;
    display: flex;
    justify-content: left;
    margin-left:8px;
  }
  div.screen {
    position:absolute;
    left:15px;
    top:5px;
    color:blue;
    font-weight: bolder;
    font-size: 15px;
  }
  img {
    object-fit: cover;
    width:50px;
  }
  td.deposit, td.collection {
    width:150px;
  }
  .pdf-footer {
    position: fixed;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 1px;
    border-top: 1px solid black;
    margin:0 20px;
  }

</style>