<script setup>
  import { ref, onMounted, onUnmounted } from 'vue'
  import { useI18n } from 'vue-i18n'    
  import _ from 'lodash'
  import { fetch } from './functions'
  import {
    newController,
    doneController,
    cancelAllInFlight
  } from '@/utilityFunctions.js'  
  import { useFormatDate } from '@/composable/useFormatDate.js'
  import Partners from './common/Partners.vue'

  const {t,locale}=useI18n()
  const inFlight = new Set()     
  const {formatLocalDate}=useFormatDate()  

  const state = ref([])
  onMounted(async () => {
    const ctrl = newController(inFlight)
    try {
      state.value = await fetch('public_jury_awards_details', ctrl.signal)
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
  <main v-if="state.length>0" class="jury-awards">
    <h2>{{state[0][0][`title_${locale}`]}}</h2>
    <section class="jury">
      <h3>{{ $t('comps.public_site.jury_awards.jury.title') }}</h3>
      <div v-if="state[2].length>0" class="jury-members">
        <div v-for="j in state[2]" class="jury-member">
          <img v-if="j.url" :src="j.url" :alt="j.jury">
          <q-icon v-else size="7rem" class="fa-solid fa-user-tie"></q-icon>
          <p>{{ j.jury }}</p>
          <p class="role" >{{ _.capitalize(j[`role_${locale}`] )}}</p>
        </div>
      </div>
      <div v-else class="jury-members">{{ $t('comps.public_site.jury_awards.jury.not') }}</div>
    </section>
    <section class="awards">
      <h3>{{ $t('comps.public_site.jury_awards.awards.title') }}</h3>
      <div class="vernissage">
        <h4>{{ `${t('comps.public_site.home.vernissage.title')}&nbsp:` }}</h4>
        <p>{{formatLocalDate(state[0][0].vernissageDateTime,locale,'dtf')}}</p>
      </div>
      <div v-for="p in state[1]"class="prizes">
        <p>
          <span class="prize">{{ p[`prize_${locale}`] }}</span>
          <span class="winner">
            <router-link
              v-if="p.idUser"
              :to="{ path:`/public/catalogue/${p.idUser}`}"
              class="win"
            >
              <img v-if="p.url" :src="p.url" :alt="p.artist">{{ p.artist }}
            </router-link>
          </span>
          <span v-if="!p.idUser" class="not-awarded">{{ $t(('comps.public_site.jury_awards.awards.not')) }}</span>
        </p>
      </div>
    </section>
  </main>
  <Partners></Partners>
</template>

<style scoped>
  main.jury-awards {
    padding:25px;
  }
  section {
    margin:20px;
  }
  section.jury {
    width:fit-content;
    min-width:200px;
    margin-left:5px;
    padding:5px 15px;
    border:2px solid var(--green);
    border-radius: 5px;
  }
  div.jury-members {
    display: flex;
    flex-wrap: wrap;
    justify-content: left;
    align-items: flex-start;
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
  div.jury-member img,div.jury-member .q-icon {
    object-fit: cover;
    width:70px;
    height:70px;
    margin-bottom: 5px;
  }
  div.jury-member .q-icon {
    opacity: .7;
  }
  div.jury-member p {
    margin:0;
  }
  div.jury-member p.role {
    font-weight: lighter;
  }
  h2,h3,h4 {    
    font-family: 'Berlin Sans FB', Arial;
    margin:0;
  }
  h2 {
    font-size: 2.5rem;
    line-height: 1.9rem;
    margin-bottom: 10px;
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
    padding-left: 15px;;
  }
  div.prizes p {
    display:flex;
    flex-direction: column;
    margin-bottom: 5px;
    margin-left: -3px;;
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
  @media screen and (min-width: 550px) {   
    section.jury {
      min-width:500px;
    }
  } 

</style>