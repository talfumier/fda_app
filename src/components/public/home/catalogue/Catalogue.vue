<script setup>
  import {ref,watch,onMounted,onUnmounted} from 'vue'
  import _ from 'lodash'
  import { useI18n } from 'vue-i18n'
  import { fetch } from '../../functions'
  import { newController,doneController,cancelAllInFlight } from '@/utilityFunctions.js'
  import Toc from './Toc.vue'
  import ArtistBlock from './ArtistBlock.vue'
  import { getCoverPage } from './functions'  
  import { useFormatDate } from '@/composable/useFormatDate.js'
  import { environment } from '@/config/environment'

  const {t,locale}=useI18n()   
  const {formatLocalDate}=useFormatDate()  
  const inFlight=new Set()
  
  const state=ref([])
  const catalogue=ref(false)    //indicates whether catalogue is visible or not
  
  const fields={
    booking:['idBooking','idUser','idRole','artist','resume_fr','resume_en','public_name','pseudo','public_pseudo','email','public_email','phone','public_phone',
    'u_url','u_fileName','public_image','idStatus_b','web1','web2','social1','social2'],
    bookingOeuvres:['idBookingOeuvre','idOeuvre','selected','showRoom','screen','idStatus_bo','title_fr','title_en','desc_en','desc_fr',
      'classic_modern','price','reserved','idDomain','domain_fr','domain_en','tech_fr','tech_en','media_fr','media_en',
      'width','height','depth','weight','o_url','o_fileName']
  }
  function getGroup(row){
    const group={}
    fields.booking.map((field) => {
      group[field]=row[field]      
    })
    group.selected=false
    group.domain={en:[],fr:[]}
    group.bookingOeuvres=[]
    return group
  }
  function getItem(row){
    const item={}
    fields.bookingOeuvres.map((field) => {
      item[field]=row[field]
    })
    return item
  }  
  const domain_artists=ref({})
  watch(
    [() => state.value?.[1], () => locale.value],
    ([newVal,newLocale]) => {
      if (!newVal || !catalogue.value) return
      let domains=`${t('comps.public_site.catalogue.guest')},`
      state.value[1].map((a) => {
        domains=domains+(a.domain[newLocale]).join(',')+','
      })
      domains= new Set((domains.split(',')).filter(d => d !== ''))
      domain_artists.value={}
      Array.from(domains).map((d) => {
        domain_artists.value[d]={
          expand:false,
          artists:state.value[1].filter((a) => {
            return a.domain[newLocale].includes(d)
          })
        }
      })
    },
    { deep: true }
  )
  onMounted(async () => {  
    const ctrl=newController(inFlight)
    try {
      state.value = await fetch('public_expo_catalogue', ctrl.signal)       
      if(!environment.production) catalogue.value=true    //in dev or test environment, catalogue is always visible (whatever is the current date vs response date)
      else if (state.value[0][0].catalogueReleased)     //in production environment, catalogue is visible when current date exceeds response date by one day
        catalogue.value=true 
      if(!catalogue.value) return
      const groupsById = {}   
      state.value[1].forEach(row => {
        const id = row.idBooking
        if (!groupsById[id]) {  
          groupsById[id] = getGroup(row)
        }
        const item=getItem(row)
        groupsById[id].bookingOeuvres.push(item) 
        const idx = (groupsById[id].domain.en).findIndex((d) => {
          return d.toLowerCase() === item.domain_en
        })  
        if(idx===-1){
          groupsById[id].domain.en.push(_.capitalize(item.domain_en))       
          groupsById[id].domain.fr.push(_.capitalize(item.domain_fr))  
        } 
      })
      state.value[1]=_.orderBy(Object.values(groupsById), ['artist'], ['asc']);  
    } catch (error) {
      console.error('onmounted failed in Catalogue.vue', error)
      return
    }
    finally {
      doneController(ctrl,inFlight)
    }
  })
  onUnmounted(() => { // clean-up code after component has unmounted  
    cancelAllInFlight(inFlight)
  }) 

</script>

<template>
  <main v-if="state.length>0" :class="['catalogue',catalogue?'col2':'']">
    <Toc v-if="catalogue"
      :domain_artists="domain_artists"
      @expand="(domain) => {
        domain_artists[domain].expand=!domain_artists[domain].expand
      }"
    >
    </Toc>
    <section class="wrapper" id="top-catalogue">
      <section class="cover-page">
        <img :src="getCoverPage(state[2],locale==='en'?4:5)" :alt="locale==='en'?'catalogue cover page':'page de garde du catalogue'" loading="lazy">
        <div v-if="!catalogue" class="banner">
          {{ locale==='en'?'Available from ':'Disponible à partir du '}}{{ formatLocalDate(state[0][0].catalogueReleaseDate,locale,'df') }}
        </div>
      </section>
      <ArtistBlock v-if="catalogue" v-for="artist in state[1]"
        :data="artist"
      >
      </ArtistBlock>
    </section>
  </main>
</template>

<style scoped>
  main.catalogue {
    display:grid;
    grid-template-columns: auto;
  }  
  nav.toc {
    display:none
  }
  section.wrapper {
    grid-column: 1;
    display:flex;
    flex-direction: column;
    align-items: center;
    padding:15px;
  }
  section.cover-page {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  section.cover-page div.banner {   
    background: red;
    color: white;
    padding: 10px 20px;
    font-size: 1.5rem;
    font-weight: bold;
  }
  section.cover-page img {
    object-fit: cover;
    width:80%;
  }
  @media screen and (min-width: 768px) {  
    main.catalogue.col2 {
      grid-template-columns: 250px auto;
    }      
    nav.toc {
      display:block;
      grid-column: 1;
      position:sticky;
      width:250px;
    }
    section.wrapper {
      grid-column: 2;
    }
  }
  @media screen and (min-width: 1200px){
    section.cover-page div.banner {      
      padding: 10px 60px;
      font-size: 2.2rem;
    }
  }
  

</style>