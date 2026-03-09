<script setup>
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  // import _ from 'lodash'
  import { fetch,openPdf } from './functions'
  import {
    newController,
    doneController,
    cancelAllInFlight
  } from '@/utilityFunctions.js'  
  import { useI18n } from 'vue-i18n'  
  import { useFormatDate } from '@/composable/useFormatDate.js'
  import MapOsm from './maps/MapOsm.vue'
  import Partners from './common/Partners.vue'

  const {locale}=useI18n()
  const inFlight = new Set()     
  const {formatLocalDate}=useFormatDate()  

  const state = ref([])
  const details = computed(() => state.value?.[0]?.[0] ?? null)
  const gallery = computed(() => Array.isArray(state.value?.[1]) ? state.value[1] : [])
  const docs = computed(() => Array.isArray(state.value?.[2]) ? state.value[2] : [])
  const expoImage = computed(() => docs.value.find(item => item.idType === 8) ?? null)
  const rulesDoc = computed(() => docs.value.find(item => item.idType === 2) ?? null)
  onMounted(async () => {
    const ctrl = newController(inFlight)
    try {
      const data = await fetch('public_home_details', ctrl.signal)
      state.value = Array.isArray(data) ? data : []
    } catch (error) {
      console.error('onmounted failed in Home.vue', error)
      state.value = []
    } finally {
      doneController(ctrl, inFlight)
    }
  })
  onUnmounted(() => {
    // clean-up code after component has unmounted
    cancelAllInFlight(inFlight)
  })
  async function openRulesDoc(){
    if (!rulesDoc.value?.url) return
    await openPdf(rulesDoc.value.url)
  }
  // function getExpoDoc(idType){
  //   return _.filter(docs.value,(item) => {
  //     return item.idType===idType
  //   })[0]
  // }
</script>

<template> 
  <div>{{`XXXXXXXX ${state?.length ?? 0}`}}</div>
  <section v-if="details" class="expo"> 
    <div class='top' >
      <div class="text">
        <img v-if="expoImage" :src="expoImage.url" :alt="expoImage.fileName"/>
        <h2>{{ details[`title_${locale}`] }}</h2>
        <p>{{ details[`desc_${locale}`] }}</p>
      </div> 
      <div class="schedule">
        <div class="opening">
          <h3>{{ $t('comps.public_site.home.opening.title') }}</h3>
          <p>{{ details[`openingTimes_${locale}`] }}</p>
        </div>
        <div class="vernissage">
          <h3>{{ $t('comps.public_site.home.vernissage.title') }}</h3>
          <p>{{formatLocalDate(details.vernissageDateTime,locale,'dtf')}}</p>
        </div>
      </div>
    </div>
    <div class="middle">
      <div class="text">
        <h2>{{ $t('comps.public_site.home.registration.title') }}</h2>
        <p class="register" v-html="$t('comps.public_site.home.registration.text')"></p>
      </div>
      <div class="register-schedule">
        <h3>{{ $t('comps.public_site.home.registration.opening') }}</h3>
        <p>{{formatLocalDate(details.openingDateTime,locale,'df')}}</p>
        <h3>{{ $t('comps.public_site.home.registration.closure') }}</h3>
        <p>{{formatLocalDate(details.closureDateTime,locale,'df')}}</p>
        <h3>{{ $t('comps.public_site.home.registration.response') }}</h3>
        <p>{{formatLocalDate(details.responseDate,locale,'df')}}</p>  
        <div v-if="rulesDoc" class="rules" @click="openRulesDoc">
          <q-icon name="article" size="2.7rem" color="green"></q-icon>
          <p class="rules">{{ $t('comps.public_site.home.registration.rules') }}</p>
        </div>  
      </div>
    </div>
    <div class="bottom">
      <img v-for="(item,idx) in gallery" :key="item.fileName" :src="item.url" :alt="item.fileName">
    </div>
  </section>
  <section v-if="details" class="visit">
    <div class="text">
      <h2>{{ $t('comps.public_site.home.visit.title') }}</h2>
      <address>
        <h3 class="building">{{ details.building }}</h3>
        <q-icon name="fa fa-home" size="2rem"></q-icon>
        <div class="address">
          <p >{{ details.address }}</p>
          <p>{{ `${details.zipCode} ${details.city}` }}</p>
          <p>{{ details.country }}</p>
        </div>
        <q-icon name="fa fa-globe" size="2rem"></q-icon>        
        <p>{{ `Latitude : ${details.gpsLat}° | Longitude : ${details.gpsLong}°` }}</p>
        <h3>{{ $t('comps.public_site.home.visit.info') }}</h3>
        <q-icon name="fa fa-envelope" size="2rem"></q-icon>  
        <a href="mailto:festivaldesarts@merville31.fr">festivaldesarts@merville31.fr</a>
        <q-icon name="fa fa-phone" size="2rem"></q-icon>  
        <p>0562134116</p>
      </address>
    </div>
    <!-- <MapOsm 
      :lat="Number(details.gpsLat)"
      :lng="Number(details.gpsLong)"
      :markers="[{
        id:1,
        lat:Number(details.gpsLat),
        lng:Number(details.gpsLong),
        label:details.building
      }]"
    >
    </MapOsm> -->
  </section>  
  <!-- <Partners></Partners> -->
</template>

<style scoped>
  section {
    display:flex;
    flex-wrap: wrap;
    justify-content: center;
    font-family: 'Roboto', Arial;
    font-size:1.5rem;  
  }
  h2,h3 {    
    font-family: 'Berlin Sans FB', Arial;
    margin:0;
  }
  h2 {
    font-size: 2.3rem;
    line-height: 1.9rem;
    margin-bottom: 10px;
  }
  div.middle h2 {
    margin-top:10px;
  }
  h3 {
    font-size: 1.8rem;
    line-height: 1.5rem;
    padding-bottom: 5px;
  }
  div.middle h3 {
    margin-top:5px;
  }
  p {
    white-space: pre-line;
    line-height: 1.9rem;
    margin:0;
  }
  div.top {
    display:grid;
    grid-template-rows: repeat(3,auto);
    grid-template-columns: repeat(2,auto);
    gap:10px;
    margin:20px;
    border:none;
  }
  div.text {
    grid-row: 1/span 2;
    grid-column: 1/span 2;
  }
  div.text p {
    text-align: justify;
  }
  div.text img {
    object-fit: cover;
    width:150px;
    float: left;
    margin-right: 15px;
  }
  div.schedule {
    grid-row: 3;
    grid-column: 1/span 2;
    display:flex;
    flex-wrap: wrap;
    gap:20px;
    margin:5px 0;
    justify-content: left;
  }
  div.schedule p,div.middle p:not(.register,.rules) {
    border-left: 5px solid var(--green);
    padding-left: 5px;
  }
  div.vernissage p {
    margin-bottom: 15px;
  }
  div.middle {    
    display:flex;
    flex-direction: column;
    justify-content: space-between;
    padding:0px 15px 5px;
    margin:20px;
    border:2px solid var(--green);
    border-radius: 5px;
  }
  div.register-schedule {
    position: relative;
    margin-bottom: 23px;
  }
  div.rules {
    display:flex;
    flex-wrap: nowrap;
    align-items: center;
    margin-top:10px;    
    cursor: pointer;
  }
  p.rules {
    padding:0 5px;
  }
  div.bottom {
    display:flex;
    flex-wrap: wrap;
    justify-content: center;
    gap:40px;
    padding: 30px 0;
  }
  div.bottom img {
    object-fit: cover;
    width:300px;
    height:250px;
    transition: transform 0.5s ease;
  }
  section.visit {
    display:flex;
    flex-wrap: wrap;
    justify-content: center;
    gap:50px;
    width: 100%;
    padding:10px 0;
    background-color: var(--orange);
  }
  address {
    display:grid;
    grid-template-rows: auto;
    grid-template-columns: 30px auto;
    gap:5px;
    font-style: normal;
  }
  address h3 {
    grid-column: 1/span 2;
    padding:5px 0;
  }
  div.address {
    display:flex;
    flex-direction: column;
  }
  div.visit .q-icon {
    justify-self: center;
    opacity: 0.7;
  }
  @media screen and (min-width: 700px){    
     div.top {
      position:relative;
      max-width:50%;
    }
    div.middle {
      max-width: 50%;
    }
  }
  @media screen and (min-width: 1000px){
    div.bottom img:hover{
      transform: scale(1.3) translateY(-20px);
      border:5px solid var(--orange);
      z-index: 1000;
    }
  }
  @media screen and (min-width: 1200px){
    div.text img {
      width:27%;
    }
    section {
      font-size:1.7rem;  
      line-height: 2rem;
    }
    h2 {
      font-size: 2.5rem;
      padding-top:10px;
    }
    h3 {
      font-size: 2rem;
      line-height: 1.7rem;
    } 
    div.middle h2 {
      margin-top: 0;
    }   
    div.rules {      
      position:absolute;
      bottom:40%;
      right:0;
    }
  }
  @media screen and (min-width: 1700px) {   
    div.top {
      max-width:44%;
    }
    div.middle {
      max-width:35%;
    }
    div.text {
      grid-row: 1;
      grid-column:1/span 2;
    }
    div.text img {
      grid-row:1/span 2;
      width:40%;
    }
    div.schedule {
      position:absolute;
      bottom:10px;
      left:40%;
      flex-direction:column;
      margin-left: 15px;
    }
  }
 
</style>
