
<script setup>
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { useRoute } from 'vue-router' 
  import { fetch,getExpoDoc,openRulesDoc } from './functions'
  import {
    newController,
    doneController,
    cancelAllInFlight
  } from '@/utilityFunctions.js'  
  import { useFormatDate } from '@/composable/useFormatDate.js'
  import LocationMap from './maps/LocationMap.vue'
  import Partners from './common/Partners.vue'

  
  const inFlight = new Set()     
  const {formatLocalDate}=useFormatDate()  

  const route=useRoute()  
  const locale = computed(() => route.params.locale || 'fr')

  const expoID = computed(() => Number(route.query.idExpo ?? -1))
  const expoIsOver = computed(() => Number(route.query.expoIsOver ?? 0))


  const state = ref([])
  onMounted(async () => {
    const ctrl = newController(inFlight)
    try {
      state.value =await fetch('public_home_details', ctrl.signal,':idExpo',expoID.value)
    } catch (error) {
      console.error('onmounted failed in Home.vue', error)
      return
    } finally {
      doneController(ctrl, inFlight)
    }
  })
  onUnmounted(() => {
    // clean-up code after component has unmounted
    cancelAllInFlight(inFlight)
  })
</script>

<template> 
  <section v-if="state.length>0" :class="['expo',(state[0][0].expoIsOver || expoIsOver===1)?'over':'']"> 
    <div class="top" >
      <div class="text">
        <img :src="getExpoDoc(8,state[2]).url" :alt="getExpoDoc(8,state[2]).fileName"/>
        <h2>{{ state[0][0][`title_${locale}`] }}</h2>
        <p v-if="!state[0][0].expoIsOver && expoIsOver===0">{{ state[0][0][`desc_${locale}`] }}</p>
        <p v-else>{{ state[0][0][`desc_after_${locale}`] }}</p>
      </div>  
      <div class="schedule">
        <div v-if="!state[0][0].expoIsOver && expoIsOver===0" class="opening">
          <h3>{{ $t('comps.public_site.home.opening.title') }}</h3>
          <p>{{ state[0][0][`openingTimes_${locale}`] }}</p>
        </div>
        <div v-if="!state[0][0].expoIsOver && expoIsOver===0"class="vernissage">
          <h3>{{ $t('comps.public_site.home.vernissage.title') }}</h3>
          <p>{{formatLocalDate(state[0][0].vernissageDateTime,locale,'dtf')}}</p>
        </div>
        <div v-else class="buttons">
          <q-btn class="award" push :href="`/${locale}/jury_awards`">
            <q-icon left size="2rem" name="fa-solid fa-trophy" />
            <div>{{$t('comps.public_site.home.buttons.award')}}&nbsp;{{ state[0][0].vernissageDateTime.slice(0,4) }}</div>
          </q-btn>
          <q-btn class="artist" push :href="`/${locale}/catalogue`" >
            <q-icon left size="2rem" name="palette" />
            <div>{{$t('comps.public_site.home.buttons.artist')}}&nbsp;{{ state[0][0].vernissageDateTime.slice(0,4) }}</div>
          </q-btn>
        </div>
      </div>
    </div>
    <div class="middle">
      <div class="text">
        <h2>{{ $t(`comps.public_site.home.registration.title${state[0][0].expoIsOver || expoIsOver===1?'_after':''}`) }}</h2>
        <p class="register">{{ state[0][0][`text${state[0][0].expoIsOver || expoIsOver===1?'_after':''}_${locale}`] }}</p>
        <p class="faq" v-html="$t('comps.public_site.home.registration.faq').replace('public',locale)"></p>
      </div>
      <div v-if="!state[0][0].expoIsOver && expoIsOver===0 && getExpoDoc(2,state[2])" class="rules" @click="openRulesDoc(state[2])">
        <q-icon name="article" size="2.7rem" color="green"></q-icon>
        <p class="rules">{{ $t('comps.public_site.home.registration.rules') }}</p>
      </div> 
      <div v-if="!state[0][0].expoIsOver && expoIsOver===0" class="register-schedule">
        <h3>{{ $t('comps.public_site.home.registration.opening') }}</h3>
        <p>{{formatLocalDate(state[0][0].openingDateTime,locale,'df')}}</p>
        <h3>{{ $t('comps.public_site.home.registration.closure') }}</h3>
        <p>{{formatLocalDate(state[0][0].closureDateTime,locale,'df')}}</p>
        <h3>{{ $t('comps.public_site.home.registration.response') }}</h3>
        <p>{{formatLocalDate(state[0][0].responseDate,locale,'df')}}</p> 
      </div>
    </div>
    <div class="bottom">
      <img v-for="(item,idx) in state[1]" :key="item.fileName" :src="item.url" :alt="item.fileName">
    </div>
  </section>
  <LocationMap v-if="state.length>0":data="state[0][0]"></LocationMap>
  <Partners></Partners>
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
  section.expo.over div.top {
   min-width:90%;
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
  div.buttons {
    display:flex;
    flex-wrap: nowrap;
    justify-content: center;
    gap:30px;
    margin:10px 0;
    width:100%;
  }
  div.schedule p,div.middle p:not(.register,.rules) {
    border-left: 5px solid var(--green);
    padding-left: 5px;
  }
  div.vernissage p {
    margin-bottom: 15px;
  }
  .q-btn.award {
    background-color:var(--orange);
  }
  .q-btn.artist {
    background-color:var(--green);
    color:var(--white);
  }
  div.middle {    
    display:flex;
    flex-direction: column;
    justify-content: space-between;
    padding:0px 15px 5px;
    margin:20px;
    border:2px solid var(--green);
    border-radius: 5px;
    max-height: fit-content;
  }
  p.faq {
    margin-top: 10px;
  }
  section.over p.faq {
    margin-bottom: 15px;
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
    section.over div.text img {
      max-width: 200px;
    }    
    section.expo.over div.top {
      min-width:70%;
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
    section.over div.text img {
      max-width: 250px;
    }
    section.expo.over div.top {
      min-width:55%;
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
