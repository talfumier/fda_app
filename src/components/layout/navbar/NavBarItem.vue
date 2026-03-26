<script setup>
  import { ref,onMounted,onUnmounted } from 'vue'
  import { getPublicEntitiesBySql } from '@/services/httpEntities.js'
  import { newController,doneController,cancelAllInFlight } from '@/utilityFunctions.js'
  import Tooltip from '../../common/Tooltip.vue'

  const props=defineProps({ 
    locale:{type:String},
    source:{type:String},
    item:{type:Object},
    isRotated:{type:Boolean,default:false},
    // screen:{type:Number,default:-1}  //automatically hide navbar text below a given screen width, default -1 (does nothing)
  })  
  
  const state=ref([])
  const inFlight=new Set()

  async function fetch(signal){
    const {data:res}=await getPublicEntitiesBySql(
      props.item.nested.sql,
      signal
    )
    if(!res || res.statusCode!==200) return
    return res.data
  }
  onMounted(async () => {  
    if(!props.item.nested) return
    const ctrl=newController(inFlight)
    try {
      state.value = await fetch(ctrl.signal) 
    } catch (error) {
      console.error('onmounted failed in NavBarItem.vue', error)
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
  <RouterLink v-if="item" :to="source==='public'?item.url.replace('en|fr',locale):item.url" tabindex="-1">
    <Tooltip :class="isRotated?'visible':'hidden'" :tt_text="item.text?$t('comps.navbar.'+item.text):''" :wrap=" item.wrap"></Tooltip>
    <div :class="['routerLink',isRotated?'folded':'',source]">
      <q-icon v-if="item.icon" :name="item.icon" :size="item.size?item.size:'3rem'" 
        :style="`padding-top:${item.padding_top}px;padding-right:${item.padding_right}px;padding-left:${item.padding_left}px;`"></q-icon>
      <p :style="`padding-top:${item.padding_top-2}px`">{{item.text?$t('comps.navbar.'+item.text):'' }}</p>
    </div>
  </RouterLink>
  <q-menu
    v-if="state[0]?.length>0"
    anchor="bottom end"
    self="top end"
  >
    <q-list dense>
      <q-item
        v-for="expo in state[0]"
        :key="expo.idExpo"
        clickable
        v-close-popup
        :to="{ path: item.url, query: { idExpo: expo.idExpo } }"
      >
        <q-item-section>
          {{ expo[`short_${locale}`] }}
        </q-item-section>
      </q-item>
    </q-list>
  </q-menu>
</template>

<style>
  .tooltip.visible {
    overflow: visible;
  }
  .tooltip.hidden {
    overflow: hidden;
  }
</style>
<style scoped>
  div.routerLink {
    display:flex;
    flex-direction: row;
    align-items: center;
    justify-content:left;
  }
  div.folder {    
    color:var(--white);
    cursor: pointer;
  }
  div.sub {
    display:flex;
    flex-direction: column;
    align-items: flex-start;
    padding-left:20px;
  }
  li.dropdown.hidden {
    display:none;    
  }
  li.dropdown.visible {
    display:flex;
    justify-content: left;
  }
  div.folded {
    justify-content:center;
  }
  .q-icon {  
    padding-right: 10px;  
    padding-left: 5px;
    text-align: center;
    transition:ease 0.2s;
  }
  .q-icon.rotate {
    transform: rotate(-180deg);

  }
  div.public .q-icon {
    padding-left:0;
  }
  div.folded .q-icon {
    padding:0;
  }
  p {
    font-size: 1.6rem;
    margin:0;
    transition: display 0.6s ease;
  }
  div.folded p,div.folded .q-icon.arrow  {
    display:none;
  }
  a,li {
    color: var(--white);
    text-decoration: none;
    display: block;
    white-space: nowrap;
    padding:0;
  }
  div.public  {    
    color: grey;
    padding-right: 5px;
  }
  div.folded.public {
    padding-right: 0;
  }
  div.footer {
    color: var(--white);
  }
  li {
    cursor: pointer;
  }
  a:not(.router-link-active) div.member:hover {
    color: var(--red);
    font-weight:bolder;
    background-color: var(--beige-opaque8);
    border-radius: 4px;
  }
  a.router-link-active div.member {
    color:var(--orange);
    font-weight: bolder;
  }   
  a:not(.router-link-active) div.public:hover {
    color: var(--orange);
    font-weight:bolder;
  }
  a.router-link-active div.public {
    color:var(--green);
    font-weight: bolder;
    border-bottom: solid var(--green);
    border-width: 5px;
    border-radius: 0;
    transition: border-width 0.3s ease;
  }
  a:not(.router-link-active) div.footer:hover {
    color: var(--white);
    font-weight: bolder;
    background-color: transparent;
    transition: width 0.3s ease;
  }
  a.router-link-active div.footer  {
    color:var(--white);
    font-weight: bolder;
  }
  .q-list {
    font-weight: bolder;
    font-size: 1.6rem;
    width:150px;    
  }
  .q-item {
    line-height: 3rem;
    color:rgb(128,128,128);
  }
  @media screen and (min-width: 1100px) {   
    p,.q-list {
      font-size: 1.8rem;
    }
    li {      
      padding:0 5px;
    }
  }
</style>