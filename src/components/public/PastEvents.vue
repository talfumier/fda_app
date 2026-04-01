<script setup>
  import { ref,computed,onMounted, onUnmounted  } from 'vue'
  import { useRoute } from 'vue-router' 
  import { fetch,getExpoDoc,openRulesDoc } from './functions'
  import {
    newController,
    doneController,
    cancelAllInFlight
  } from '@/utilityFunctions.js' 
  import Catalogue from './catalogue/Catalogue.vue'
  import Carousel from './common/Carousel.vue'
  import NotYet from '@/components/general/NotYetDev.vue'  
  import JuryAwards from './JuryAwards.vue'
  import LocationMap from './maps/LocationMap.vue'
  import Partners from './common/Partners.vue'
  
  const inFlight = new Set() 

  const route=useRoute() 
  const locale = computed(() => route.params.locale || 'fr')
  const expoID = computed(() => Number(route.query.idExpo ?? -1))

  const state = ref([])
  onMounted(async () => {
    if(expoID.value===-1) return
    const ctrl = newController(inFlight)
    try {
      state.value = await fetch('public_past_events_details', ctrl.signal,':idExpo',expoID.value)
    } catch (error) {
      console.error('onmounted failed in PastEvents.vue', error)
      return
    } finally {
      doneController(ctrl, inFlight)
    }
  })
  onUnmounted(() => {    
    cancelAllInFlight(inFlight)   // clean-up code after component has unmounted
  })

</script>

<template>
  <main class="past-events">
    <section v-if="state.length>0" class="expo"> 
      <div class="text">
        <img v-if="state[2]?.length>0" :src="getExpoDoc(8,state[2]).url" :alt="getExpoDoc(8,state[2]).fileName"/>
        <h2>{{ state[0][0][`title_${locale}`] }}</h2>
        <p>{{ state[0][0][`desc_after_${locale}`] }}</p>
      </div>
    </section>
    <JuryAwards v-if="expoID!==-1" :expoID="expoID" source="past-events-page"></JuryAwards>
    <Catalogue :past="true"></Catalogue>
    <section v-if="state[1]?.length>0" class="carousel">
      <h2>{{$t('comps.public_site.past_events.titles.photos') }}&nbsp;&nbsp;{{state[0][0].vernissageDateTime.slice(0,4)}}</h2>
      <Carousel
        :locale="locale"
        :data="state[1]"
        class="past-carousel"
      >
      </Carousel>
    </section>
    <NotYet v-if="expoID===-1" :locale="locale" :icon="true" type="noData"></NotYet>   
  </main>
    <LocationMap v-if="state.length>0":data="state[0][0]"></LocationMap>
    <Partners v-if="expoID!==-1"></Partners>
</template>

<style scoped>
  main.past-events {
    display:flex;
    flex-direction: column;
    align-items: center;
  }
  section.expo,section.carousel {    
    display:flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap:10px;
    font-family: 'Roboto', Arial;
    font-size:1.5rem;  
    padding:20px 20px 20px;
  }
  h2,h3 {    
    font-family: 'Berlin Sans FB', Arial;
    margin:0;
  }
  h2 {
    font-size: 2.3rem;
    line-height: 2.2rem;
    margin-bottom: 10px;
  }
  h3 {
    font-size: 1.8rem;
    line-height: 1.5rem;
    padding-bottom: 5px;
  }
  p {
    white-space: pre-line;
    line-height: 1.9rem;
    font-size:1.8rem;
    margin:0;
  }
  div.text {
    width:90%;
    max-width: 1000px;
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
  @media screen and (min-width: 768px){    
    section.carousel {
      padding:5px 20px 20px;
    }
  }
  @media screen and (min-width: 1000px){
   
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
  }
  @media screen and (min-width: 1700px) {   
     section.expo {
      max-width:50%;
    } 
    div.text img {
      width:27%;
      max-width: 200px;
    } 
    div.text img {
      width:40%;
      max-width: 250px;
    }
  }
</style>