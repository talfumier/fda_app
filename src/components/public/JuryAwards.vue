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
    <section class="awards">
      <h2>{{ $t('comps.public_site.jury_awards.awards.title') }}</h2>
      <div class="vernissage">
        <h3>{{ `${t('comps.public_site.home.vernissage.title')}&nbsp:` }}</h3>
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

</style>