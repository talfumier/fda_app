<script setup>
  import { ref,onMounted,onUnmounted } from 'vue'
  import { getEntitiesBySql } from '@/services/httpEntities.js'
  import { environment } from '@/config/environment.js'
  import { newController,doneController,cancelAllInFlight } from '@/utilityFunctions.js'
  import Tooltip from '../../common/Tooltip.vue'

  const props=defineProps({
    item:{type:Object},
    isRotated:{type:Boolean,default:false},
    screen:{type:Number,default:-1}  //automatically hide navbar text below a given screen width, default -1 (does nothing)
  })

  const state=ref([])
  const expand=ref(props.item.expand)
  const inFlight=new Set()

  async function fetch(signal){
    if(!props.item) return
    const {data:res}=await getEntitiesBySql(
      props.item.sql,
      environment.public_token,
      signal,
      props.item.sql_param,
      props.item.param_value
    )
    if(res.statusCode===200) return res.data
  }
  onMounted(async () => {  
    if(!props.item.sql) return
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
  <RouterLink v-if="item && !item.type" :to="item.url" tabindex="-1">
    <Tooltip :class="isRotated?'visible':'hidden'" :tt_text="item.text?$t('comps.navbar.'+item.text):''" :wrap=" item.wrap"></Tooltip>
    <div :class="[isRotated?'folded':'']">
      <q-icon v-if="item.icon" :name="item.icon" size="3rem"></q-icon>
      <p v-if="screen>0?$q.screen.width>screen:true">{{item.text?$t('comps.navbar.'+item.text):'' }}</p>
    </div>
  </RouterLink>
  <Tooltip :class="isRotated?'visible':'hidden'" :tt_text="item.text?$t('comps.navbar.'+item.text):''" :wrap="item.wrap"></Tooltip>
  <div v-if="item && item.type==='nested'"
    :class="['folder',isRotated?'folded':'']"
    @click="() => {
        expand=!expand
      }"
  >
    <q-icon v-if="item.icon" :name="item.icon" size="3rem"></q-icon>
    <p v-if="screen>0?$q.screen.width>screen:true">{{item.text?$t('comps.navbar.'+item.text):'' }}</p>      
    <q-icon name="keyboard_arrow_down" size="3rem" :class="expand?'rotate':''"></q-icon>
  </div>
  <div v-if="item && expand"  class="sub">
    <li v-for="(link) in state[0]" :class="['dropdown',expand?'visible':'visible']">
      <RouterLink :to="`${item.url}/${link.idExpo}?idStatus=${link.idStatus}`" >    
        <div :class="[isRotated?'folded':'']">
          <p>{{link.short_en }}</p>
        </div>    
      </RouterLink>
    </li> 
  </div>
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
  div {
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
  div.folded .q-icon {
    padding:0;
  }
  p {
    margin:0;
    transition: display 0.6s ease;
  }
  div.folded p {
    display:none;
  }
  a,li {
    color: var(--white);
    text-decoration: none;
    display: block;
    border-radius: 4px;
  }
  li {
    cursor: pointer;
  }
  a:not(.router-link-active):hover {
    color: var(--red);
    font-weight:bolder;
    background-color: var(--beige-opaque8);
    padding: 0 10px;
  }
  a.router-link-active {
    color:var(--orange);
    font-weight: bolder;
  }
  footer  a:not(.router-link-active):hover {
    color: var(--white);
    background-color: transparent;
  }
  footer a.router-link-active {
    color:var(--white);
  }
</style>