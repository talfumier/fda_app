<script setup>
  import {ref,watch,onMounted,onUnmounted, nextTick} from 'vue'
  import { useRoute } from "vue-router"
  import _ from 'lodash'
  import { useI18n } from 'vue-i18n'
  import { fetch } from '../functions'
  import { newController,doneController,cancelAllInFlight } from '@/utilityFunctions.js'
  import Toc from './Toc.vue'
  import ArtistBlock from './ArtistBlock.vue'
  import Partners from '../common/Partners.vue'
  import { getCoverPage } from './functions'  
  import { useFormatDate } from '@/composable/useFormatDate.js'
  import { scrollToSection } from './functions'
  import { environment } from '@/config/environment'

  const props=defineProps({
    idUser:{type:String,default:null},   //idUser parameter coming from jury_awards page as a route parameter (ref. to routes.js) >>> vertical scroll to an awarded artist
    print:{type:Boolean,default:false},   //print parameter coming from routes.js /member/catalogue_print route
    past:{type:Boolean,default:false},    //parameter indicating Catalogue component is called the past events page
  })

  const route=useRoute() 
  const locale=ref('fr')  //catalogue print case

  const {t}=useI18n()   
  const {formatLocalDate}=useFormatDate()  
  const inFlight=new Set()

  const expand=ref(false)
  
  const state=ref([])
  const catalogue=ref(false)    //indicates whether catalogue is visible or not
  
  const fields={
    booking:['idBooking','idUser','idRole','role_fr','role_en','artist','resume_fr','resume_en','public_name','pseudo','public_pseudo','email','public_email','phone','public_phone',
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
    [() => state.value?.[1], () => route.params?.locale],
    ([newVal,newLocale]) => {
      if (!newVal || !catalogue.value) return
      if(!newLocale) newLocale='fr'
      else locale.value=route.params.locale
      let domains=`${t('comps.public_site.catalogue.guest')},`
      state.value[1].map((a) => {
        domains=domains+(a.domain[newLocale]).join(',')+','
      })
      domains= new Set((domains.split(',')).filter(d => d !== ''))
      domain_artists.value={}
      Array.from(domains).map((d) => {
        if(d===t('comps.public_site.catalogue.guest')) 
          domain_artists.value[d]={
            expand:false,
            artists:state.value[1].filter((a) => {
              return a.idRole===2
            })
          } 
        else
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
  function filterBookingOeuvres() {
    _.cloneDeep(state.value[1]).map((b,idx) => {
      state.value[1][idx].bookingOeuvres=_.filter(state.value[1][idx].bookingOeuvres,(bo) => {
        return bo.idStatus_bo===15 || bo.idStatus_bo===17    //candidate or accepted bookingOeuvres > i.e not rejected
      })
    })
  }
  onMounted(async () => {  
    const ctrl=newController(inFlight)
    try {
      // ':idExpo,:idStatus','-1;[8,10,27]')  >> retrieve all data from the last on-going expo, status=candidate|accepted|payment received  
      let paramsValues=null
      if(props.print) // route query coming from API back-end during catalogue export in PDF (selection criteria for export,idExpo, idStatus)
        paramsValues=`${route.query && route.query.paramsValues?route.query.paramsValues:'-1;[8,10,27]'}`
      else if(props.past)  //url query parameter ?idExpo=xxx
        paramsValues=`${route.query.idExpo};[10,27]`
      else //last on-going expo >>> catalogue main page on public site
        paramsValues='-1;[10,27]'
      state.value = await fetch('public_expo_catalogue', ctrl.signal,':idExpo,:idStatus',paramsValues)  
      if(!environment.production) catalogue.value=true    //in dev or test environment, catalogue is always visible (whatever is the current date vs response date)
      else if (state.value[0][0].catalogueReleased===1 || props.print) {   //in production environment, on line catalogue is visible when current date exceeds response date by one day
        catalogue.value=true 
        state.value[1]=_.filter(state.value[1],(b) => {
          return b.idStatus_b>=10  //accepted bookings only
        })
        filterBookingOeuvres() //accepted or candidate bookingOeuvres > i.e not rejected
      }
      if(route?.query?.paramsValues && !route.query.paramsValues.split(";")[1].includes('8')) filterBookingOeuvres() //accepted bookingOeuvres only
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
      state.value[1]=_.orderBy(Object.values(groupsById), ['artist'], ['asc'])
    } catch (error) {
      console.error('onmounted failed in Catalogue.vue', error)
      return
    }
    finally {
      doneController(ctrl,inFlight)
      if(!props.idUser) return
      await nextTick()
      setTimeout(() => {
        scrollToSection(`artist${props.idUser}`)
      },500)
      
    }
  })
  onUnmounted(() => { // clean-up code after component has unmounted  
    cancelAllInFlight(inFlight)
  }) 

</script>

<template>
  <main v-if="state.length>0" :class="['catalogue',print?'print':'',catalogue && !print?'col2':'',past?'past':'']">
    <div v-if="past && route.query.idExpo" class="artist-button">
        <q-btn 
          class="artist" push
          @click="expand = !expand"
        >
          <q-icon left size="2rem" name="palette" />
          <div>{{$t('comps.public_site.home.buttons.artist')}}&nbsp;{{state[0][0].catalogueReleaseDate.slice(0,4) }}</div>
          <q-icon right
            name="keyboard_arrow_down"
            size="3rem"
            :style="`transform: rotate(${expand ? '-180deg' : '0deg'});transition: 0.6s ease;`"
          >
          </q-icon>
        </q-btn>
      </div>
    <Toc v-if="(!past && catalogue && !print) || (past && expand)"
      :domain_artists="domain_artists"
      :idUser="idUser"
      :past="past"
      @expand="(domain) => {
        domain_artists[domain].expand=!domain_artists[domain].expand
      }"
    >
    </Toc>
    <section :class="['wrapper',print?'print':'',past?'past':'']" id="top-catalogue">
      <section v-if="!past" class="cover-page ">
        <img 
          :src="getCoverPage(state[2],!print?(locale==='en'?4:5):6)" 
          :alt="locale==='en'?'catalogue cover page':'page de garde du catalogue'">
        <div v-if="!catalogue && !print" class="banner">
          {{ locale==='en'?'Available from ':'Disponible à partir du '}}{{ formatLocalDate(state[0][0].catalogueReleaseDate,locale,'df') }}
        </div>
      </section>
      <section v-if="print" class="intro">
        <img 
          :src="getCoverPage(state[2],7)" 
          :alt="locale==='en'?'catalogue intro':'intro du catalogue'" >
      </section> 
      <br v-if="!past">    
      <section v-if="print" class="guests break-before">
        <h2 >Invités d'honneur</h2>
      </section>  
      <br v-if="!past">       
      <ArtistBlock v-if="print" v-for="artist in _.filter(state[1],(item) => {
        return item.idRole===2    //guests only
      }).sort((a, b) => (a.domain.fr[0]).localeCompare(b.domain.fr[0]))"
        :locale="locale"
        :data="artist"
        :print="print"
        style="grid-column: 1/-1;"
      >
      </ArtistBlock>
      <br v-if="!past">
      <section v-if="print" class="artists break-before" 
        style="grid-column: 1;">          
        <h2 >Artistes</h2>
      </section>
      <br v-if="!past">
      <ArtistBlock v-if="(!past && catalogue && !print) || (past && expand)" v-for="artist in state[1]"       
        :locale="locale"
        :data="artist"
        :print="print"
      >
      </ArtistBlock>
      <ArtistBlock v-if="print" v-for="artist in _.filter(state[1],(item) => {
        return item.idRole!==2    //guests filtered out
      })"
        :locale="locale"
        :data="artist"
        :print="print"
      >
      </ArtistBlock>
    </section>
  </main>  
  <Partners v-if="!past" :print="print" class="break-before"></Partners>
</template>

<style scoped>
  main.catalogue {
    display:grid;
    grid-template-columns: 100%;
    max-width:90%;
  } 
  main.catalogue.print {
    grid-template-columns: auto;
  }
  h2 {
    font-family: Berlin Sans FB Bold;
    font-size: 8rem;
  }
  nav.toc {
    display:none
  }
  div.artist-button {
    display:flex;
    justify-content: center;
    height:100%;
    position:sticky;
    top:-20px;   
    z-index: 10000;
  }
  div.artist-button .q-btn.artist {
    background-color:var(--green);
    color:var(--white); 
    margin-top:20px;
  }
  section.wrapper {
    grid-column: 1;
    display:flex;
    flex-direction: column;
    align-items: center;
    padding:20px;
  }
  section.wrapper.past {
    padding-top:0;;
  }
  section.wrapper.print {
    display:grid;
    grid-template-columns: repeat(2,50%);
    grid-template-rows: auto;
    justify-content:center;
    align-items: flex-start;
    gap:5px;
  }
  section.wrapper.print section.artist {
    outline: 1px solid #ccc;
    height:100%;
  }
  section.cover-page {
    grid-column: 1/-1;
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
  section.intro {
    display:flex;
    justify-content: center;
    width:200%;
  }
  section.guests, section.artists {
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    width:200%;
    text-align: center;
  }
  section.intro img {
    object-fit: cover;
    width:200%;
  }
  section.wrapper.print section.cover-page img {
    width:100%;
    height:100%;
  }
  section.partner.print {
    justify-self: center;
    max-width:50%;
  }  
  .break-before {
    break-before: page;
  }
  .break-after {
    break-after: page;
  }
  @media screen and (min-width: 768px) {  
    main.catalogue.col2 {
      grid-template-columns: 250px auto;
    } 
    nav.toc {
      display:block;
      grid-column: 1;
      width:250px;
    }
    section.wrapper {
      grid-column: 2;
    }
    div.artist-button {
      grid-column: 1/-1;
    }
  }
  @media screen and (min-width: 1200px){
    section.cover-page div.banner {      
      padding: 10px 60px;
      font-size: 2.2rem;
    }
  }
  

</style>