<script setup>
  import { ref, computed, onMounted, onUnmounted } from 'vue'  
  import { useRoute } from 'vue-router' 
  import { useI18n } from 'vue-i18n'    
  import _ from 'lodash'
  import { fetch } from './functions.js'
  import {
    newController,
    doneController,
    cancelAllInFlight
  } from '@/utilityFunctions.js'  
  import { useFormatDate } from '@/composable/useFormatDate.js'
  import Carousel from './common/Carousel.vue'
  import Partners from './common/Partners.vue'

  const props=defineProps({
    source:{type:String,default:'jury-awards-page'},
    expoID:{type:Number,default:-1}   //when default value is used, last on-going expo is retrieved in the SQL stored procedure
  })

  const route=useRoute()  
  const locale = computed(() => route.params.locale || 'fr')

  const {t}=useI18n()
  const inFlight = new Set()     
  const {formatLocalDate}=useFormatDate()  

  const state = ref([])
  onMounted(async () => {
    const ctrl = newController(inFlight)
    try {
      state.value = await fetch('public_jury_awards_details', ctrl.signal,':idExpo',props.expoID)
    } catch (error) {
      console.error('onmounted failed in JuryAwards.vue', error)
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
  <main v-if="state.length>0" :class="['jury-awards',source==='past-events-page'?'past':'']">
    <h2 v-if="source==='jury-awards-page'">{{state[0][0][`title_${locale}`]}}</h2>
    <h2 v-if="source==='past-events-page'">{{$t('comps.public_site.past_events.titles.jury_awards') }}&nbsp;&nbsp;{{state[0][0].vernissageDateTime.slice(0,4)}}</h2>
    <section class="jury">
      <h3>{{ $t('comps.public_site.jury_awards.jury.title') }}</h3>
      <div v-if="state[2].length>0" class="jury-members">
        <div v-for="j in state[2]" class="jury-member">
          <img v-if="j.url" :src="j.url" :alt="j.jury">
          <div v-else>?</div>
          <p>{{ j.jury }}</p>
          <p class="role" >{{ _.capitalize(j[`role_${locale}`] )}}</p>
        </div>
      </div>
      <div v-else class="jury-members">{{ $t('comps.public_site.jury_awards.jury.not') }}</div>
    </section>
    <section class="awards">
      <h3 v-if="source==='jury-awards-page'">{{ $t('comps.public_site.jury_awards.awards.title') }}</h3>
      <div v-if="source==='jury-awards-page'" class="vernissage">
        <h4>{{ `${t('comps.public_site.home.vernissage.title')}&nbsp:` }}</h4>
        <p>{{formatLocalDate(state[0][0].vernissageDateTime,locale,'dtf')}}</p>
      </div>
      <div class="prizes">
        <p v-for="p in state[1]">
          <span class="prize">{{ p[`prize_${locale}`] }}</span>
          <span class="winner">
            <router-link
              v-if="p.idUser"
              :to="{ path:`/${locale}/catalogue/${p.idUser}`}"
              class="win"
            >
              <img v-if="p.url" :src="p.url" :alt="p.artist">{{ p.artist }}
            </router-link>
          </span>
          <span v-if="!p.idUser" class="not-awarded">{{ $t(('comps.public_site.jury_awards.awards.not')) }}</span>
        </p>
      </div>
    </section>
    <section v-if="state[3]?.length>0 && state[3][0].awardPhotosVisible && source==='jury-awards-page'" class="carousel">
      <Carousel
        :locale="locale"
        :data="state[3]"
      >
    </Carousel>
    </section>
  </main>
  <Partners v-if="source==='jury-awards-page'"></Partners>
</template>

<style scoped>
  main.jury-awards {
    display:grid;
    grid-template-rows: 50px repeat(3,auto);
    grid-template-columns: auto;
    margin:5px 15px;
  }
  main.jury-awards.past {
    grid-template-rows: repeat(3,auto);
  }
  h2,h3,h4 {    
    font-family: 'Berlin Sans FB', Arial;
    margin:0;
  }
  h2 {    
    grid-row:1;
    grid-column: 1;
    font-size: 2.3rem;
    line-height: 2.4rem;
    margin-bottom: 15px;
  }
  main.past h2 {
    text-align: center;
  }
  h3 {
    font-size: rem;
    line-height: 1.7rem;
  }
  section.jury {
    grid-row:2;
    grid-column: 1;
    width:fit-content;
    min-width:200px;
    margin-left:5px;
    padding:5px 15px;
    border:2px solid var(--green);
    border-radius: 5px;
  }
  main.past section.jury {
    margin:0 auto;
  }
  div.jury-members {
    display: grid;
    grid-template-columns: repeat(2,auto);
    gap:20px;
    font-size: 1.8rem;
    padding:10px;
  }
  div.jury-member {
    display:flex;
    flex-direction: column;
    align-items: center;
    font-size: smaller;
    font-weight: bolder;
  }
  div.jury-member img{
    object-fit: cover;
    width:70px;
    height:70px;
    margin-bottom: 5px;
  }
  div.jury-member div {
    display:flex;
    justify-content: center;
    align-items: center;
    width:70px;
    height:70px;
    border:solid 1px var(--black);
    font-size: 3rem;
    font-weight: bolder;
    opacity: .7;
    margin-bottom: 5px;
  }
  div.jury-member p {
    margin:0;
    text-align: center;
  }
  div.jury-member p.role {
    font-weight: lighter;
  }
  h3 {
    font-size: 2.2rem;
    line-height: 1.9rem;
    margin-bottom: 10px;
  }
  h4 {
    font-size: 2rem;
    line-height: 2rem;
    padding: 5px 0;
  }
  section.awards {
    grid-row:3;
    grid-column: 1;
    margin-top:20px;
  }
  div.vernissage {    
    display:flex;
    flex-wrap: wrap;
    justify-content: left;
    align-items: center;
    gap:5px;
    border-left: 5px solid var(--green);
    padding-left: 5px;
    margin-bottom: 10px;
  }
  div.vernissage p,div.prizes p {
    white-space: pre-line;
    font-size: 1.7rem;
    line-height: 2rem;
    padding-top: 3px;;
    margin: 0;   
  }
  div.prizes {
    display:flex;
    flex-wrap: wrap;
    justify-content:left;
    row-gap:5px;
    column-gap: 20px;
    padding-left: 15px;
  }
  main.past div.prizes {    
    justify-content:center;
  }
  div.prizes p {
    display:flex;
    flex-direction: column;
    justify-content: space-between;
    margin-bottom: 5px;
    margin-left: -3px;
    width:250px;
  }
  span.prize {
    font-weight: bolder;
  }
  span.winner a  {
    padding-left: 15px;
    text-decoration: none;
    color: inherit;
  }
  a.win {
    display:flex;
    align-items: center;
  }
  span.winner a.win:hover{ 
    text-decoration: underline; 
    color:blue;
  }  
  span img {
    object-fit: cover;
    width:40px;
    height:40px;
    padding:0 5px;
  }
  span.not-awarded {
    padding-left: 15px;
  }
  section.carousel {
    grid-row:4;
    grid-column: 1;
    margin:30px 0;
    max-width:500px;
  }
  @media screen and (min-width: 414px) { 
    main.jury-awards {
      grid-template-rows: 45px repeat(3,auto);
    } 
    main.jury-awards.past {      
      grid-template-rows: repeat(3,auto);
    }
    div.jury-members {
      grid-template-columns: repeat(3,auto);
    } 
  } 
  @media screen and (min-width: 550px) { 
    main.jury-awards {
      margin:0px 25px;
    }  
    section.jury {
      min-width:500px;
    }
  } 
  @media screen and (min-width: 840px) { 
    div.jury-members {
      grid-template-columns: repeat(4,auto);
    } 
  } 
  @media screen and (min-width: 1000px){
    h2 {
      font-size: 2.5rem;      
      padding-top:10px;
    }
    h3 {
      font-size: 2rem;
      line-height: 1.7rem;
    }
  }
  @media screen and (min-width: 1200px) { 
    main.jury-awards {
      max-width:50%;
    } 
    section.carousel {
      grid-row: 1/-1;
      grid-column: 2;
    }
  } 

</style>