<script setup> 
  import {ref,onMounted,onUnmounted} from 'vue'
  import { useRoute } from "vue-router"
  import { fetch } from '../public/functions'
  import { newController,doneController,cancelAllInFlight,getCloudinaryResizedUrl } from '@/utilityFunctions.js'
  import Header from './Header.vue'

  const props=defineProps({
    locale:{type:String}
  })
  
  const route=useRoute()
  const inFlight = new Set()   
  const state=ref([])

  onMounted(async () => {  
    const ctrl=newController(inFlight)
    try {
      if(!route.query) return
      state.value = await fetch('booking_status_change', ctrl.signal,':idBooking',route.query.idBooking) 
    } catch (error) {
      console.error('onmounted failed in EmailAttacht.vue', error)
      return
    }
    finally {
      doneController(ctrl,inFlight)      
    }
  })
  onUnmounted(() => { // clean-up code after component has unmounted  
    cancelAllInFlight(inFlight)
  })
  const columns=[{en:'Art work',fr:'Oeuvre'},{en:'Show room',fr:'En salle'},{en:'Screen',fr:"A l'écran"},{en:'Deposit',fr:"Dépôt"},{en:'Collection',fr:'Retrait'}]

</script>

<template>
  <Header></Header>
  <section v-if="state[0]?.length>0 && locale==='en'" class="text">
    <p>Dear <strong>{{ state[0][0].artist }}</strong>,</p><br>
    <p>Following your registration for the <strong>{{ state[0][0].short_en }}</strong>, the selection committee has approved your art works listed below.</p><br>
    <p>The amount of your financial contribution is <strong>{{ state[0][0].price }} €</strong>, to be paid no later than <strong>{{ state[0][0].deadline }}</strong>.</p>
    <p>Upon receipt of payment, your registration will be formally validated.</p><br>
    <p>Additionally, please remember to bring this document with you for the deposit and collection of your art works.</p>
    <p class="regards">Best regards,</p>
    <p class="signature">The Selection Committee.</p><br>
    <p class="date">Art works deposit : <strong>{{ state[0][0].depot }}</strong></p>
    <p class="date">Art works collection : <strong>{{ state[0][0].collection }}</strong></p>
  </section>
  <section v-if="state[0]?.length>0 && locale==='fr'" class="text">
    <p>Cher(e) <strong>{{ state[0][0].artist }}</strong>,</p><br>
    <p>Suite à votre inscription au <strong>{{ state[0][0].short_fr }}</strong>, le Comité de Sélection a approuvé les oeuvres telles qu'indiquées dans le tableau ci-dessous.</p><br>
    <p>Le montant de votre contribution financière est de  <strong>{{ state[0][0].price }} €</strong>, à régler avant le <strong>{{ state[0][0].deadline }}</strong>.</p>
    <p>A réception du paiement, votre inscription sera définitivement validée.</p><br>
    <p>Nous vous remercions de bien vouloir vous munir ce document pour le dépôt et le retrait de vos oeuvres.</p>
    <p class="regards">Meilleures salutations,</p>
    <p class="signature">Le Comité de Sélection.</p><br>
    <p class="date">Dépôt des oeuvres : <strong>{{ state[0][0].depot }}</strong></p>
    <p class="date">Retrait des oeuvres : <strong>{{ state[0][0].collection }}</strong></p>
  </section>
  <table>
    <tr>
      <th v-for="col in columns">{{ col[locale] }}</th>
    </tr>
    <tr v-for="row in state[0]">    
      <td class="art-work" >
        <img class="oeuvre" :src="getCloudinaryResizedUrl(row.url,50,50)" loading="lazy"></img>
        <p>{{ row[`title_${locale}`] }} <sup v-if="row.catalogue">(1)</sup></p>
      </td>   
      <td ><q-icon :name="`${row.showRoom===0?'close':'check'}`" size="2.2rem" :color="`${row.showRoom===0?'red':'green'}`"/></td>        
      <td ><q-icon :name="`${row.screen===0?'close':'check'}`" size="2.2rem" :color="`${row.screen===0?'red':'green'}`"/></td> 
      <td class="deposit" >{{`${row.showRoom===0?'N/A':''}`}}</td> 
      <td class="collection">{{`${row.showRoom===0?'N/A':''}`}}</td> 
    </tr>
  </table>
  <p class="sup"><sup>(1)</sup> {{`${locale==='en'?'Proposed art work for the official exhibion catalogue.':'Oeuvre proposée pour le catalogue officiel de l\'exposition.'}`}}</p>
</template>

<style scoped>
  section {
    margin:50px;
  }
  p {
    margin:0;
    line-height: 2rem;
    text-align: justify;
  }
  p.regards, p.signature {
    margin-top:1.3rem;
  }
  p.date {
    display:flex;
    flex-wrap: nowrap;
    justify-content: space-between;
    width:300px;
  }
  table, th, td {
    border: 1px solid black;
    text-align: center;
  }
  th {    
    background-color: rgb(230, 227, 227); 
  }
  table {
    margin-left:50px;
  }
  th {
    padding:5px 10px;
  }
  td.art-work {
    display:flex;
    flex-wrap: nowrap;
    justify-content: left;
    align-items: center;
    gap:10px;
    padding:5px;
    width:250px;
    max-width:300px;
  }
  img {
    object-fit: cover;
    width:50px;
  }
  .q-icon {
    font-weight: 600;
  }
  td.deposit, td.collection {
    width:150px;
  }
  p.sup {
    margin: 10px 55px;
  }

</style>