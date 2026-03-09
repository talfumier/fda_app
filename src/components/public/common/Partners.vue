<script setup>
  import { ref, onMounted, onUnmounted } from 'vue'
  import { fetch } from '../functions'
  import {
    newController,
    doneController,
    cancelAllInFlight
  } from '@/utilityFunctions.js'  

  const props=defineProps({
    print:{type:Boolean,default:false}
  })
  
  const inFlight = new Set()

  const state = ref([])
  onMounted(async () => {
    const ctrl = newController(inFlight)
    try {
      state.value = (await fetch('public_expo_partners', ctrl.signal))[0]
    } catch (error) {
      console.error('onmounted failed in Partners.vue', error)
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
  <section :class="['partner',print?'print':'']"> 
    <br v-if="print"><br v-if="print"><br v-if="print"> 
    <h2>{{ $t('comps.public_site.home.partner.label') }}</h2>
    <br v-if="print"><br v-if="print"><br v-if="print"> 
    <div class="logos">
      <div v-for="item in state" class="logo">
        <a :href="item.web1" target="blank">
          <img :src="item.url" :alt="item.name" loading="lazy">
        </a>
      </div>
    </div>
  </section>

</template>

<style scoped>
  section.partner {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: var(--white);
    width:100%;
  }
  h2 {
    font-family: 'Montserrat', sans-serif;
    font-size: 1.8rem;
    font-weight: 550;
  }
  section.print h2 {
    font-size: 3rem;
    font-weight: 700;
  }
  div.logos {
    display:flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap:40px;
    padding-bottom: 15px;
  }
  section.print div.logos {
    justify-content: space-evenly;
    width:100%;
  }
  section.print div.logo {  
    padding:20px 30px;  
    margin:0 auto;
  }
  img {
    object-fit: cover;
    height:60px;
    cursor: pointer;
  }
  section.print img {
    height:150px;
  }
  @media screen and (min-width: 1200px) {  
    section.print div.logos {
      justify-content: space-around;
    }
    img {
      height:100px;
    } 
  } 

</style>