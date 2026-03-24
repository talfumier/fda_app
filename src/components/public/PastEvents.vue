<script setup>
  import { ref,computed,onMounted, onUnmounted  } from 'vue'
  import { useRoute } from 'vue-router' 
  import { useI18n } from 'vue-i18n'  
  import { fetch,getExpoDoc,openRulesDoc } from './functions'
  import {
    newController,
    doneController,
    cancelAllInFlight
  } from '@/utilityFunctions.js' 
  import Carousel from './common/Carousel.vue'
  import NotYet from '@/components/general/NotYetDev.vue'  
  import JuryAwards from './JuryAwards.vue'
  import Partners from './common/Partners.vue'
  
  const {locale}=useI18n()
  const inFlight = new Set() 

  const route=useRoute()
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
  <section v-if="state.length>0" :class="['expo','over']"> 
    <div class="top" >
      <div class="text">
        <img v-if="state[2]?.length>0" :src="getExpoDoc(8,state[2]).url" :alt="getExpoDoc(8,state[2]).fileName"/>
        <h2>{{ state[0][0][`title_${locale}`] }}</h2>
        <p>{{ state[0][0][`desc_${locale}`] }}</p>
      </div> 
    </div>
  </section>
  <JuryAwards v-if="expoID!==-1" :expoID="expoID" source="past-events-page"></JuryAwards>
  <section v-if="state[1]?.length>0" class="carousel">
    <Carousel
      :data="state[1]"
    >
    </Carousel>
  </section>
  <NotYet v-if="expoID===-1":icon="true" type="noData"></NotYet>  
  <Partners v-if="expoID!==-1"></Partners>
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
  h3 {
    font-size: 1.8rem;
    line-height: 1.5rem;
    padding-bottom: 5px;
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
  section.carousel {
    margin:30px auto;
    max-width:700px;
  }
  @media screen and (min-width: 700px){    
     div.top {
      position:relative;
      max-width:50%;
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
  }
</style>