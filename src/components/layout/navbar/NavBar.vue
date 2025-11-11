<script setup>
  import { ref,watch,inject,computed, onMounted, onUnmounted } from 'vue'  
  import _ from 'lodash'
  import Tooltip from '../../common/Tooltip.vue'
  import public_items from './nav-items-public.json'
  import member_items from "./nav-items-member.json"
  import NavBarItem from './NavBarItem.vue'
  import { getEntitiesBySql } from '@/services/httpEntities.js'
  
  const props = defineProps({
    type:{type:String},
    wrap:{type:Boolean,default:false}
  })
  
  const ctrl=new AbortController()  
  watch(
    () => props.type, //getter function
    async() => {  
      if(props.type==='member') await fetch(ctrl.signal)
    }
  )
  
  const url=ref(null)
  const isRotated = ref(false)
  function rotateIcon() {
    isRotated.value=!isRotated.value
  }
  const {token,decoded} = inject('userCookie')
  const roleFilteredItems=computed(() => {
    if(props.type==='public') return public_items
    return _.filter(member_items,(item) => {
      return decoded.value.idRole?item.roles.includes(decoded.value.idRole):false
    })
  })
  
  async function fetch(signal){
    const {data:res}=await getEntitiesBySql(
      'avatar',
      token.value,
      signal,
      ':idUser', 
      decoded.value.idUser
    )
    if(res.statusCode===200) {
      url.value=res.data[0][0]?.url
    }
  }
  onMounted(async() => {
    if(props.type==='public') return
    await fetch(ctrl.signal)
  })
  onUnmounted(() => { // clean-up code after component has unmounted
    ctrl.abort()
  }) 
</script>

<template>
    <nav :class="[isRotated || $q.screen.width<850?'folded':'',type]">
      <ul>
        <q-icon v-if="$q.screen.width>850"
          class="btn-fold" 
          name="keyboard_double_arrow_left" 
          size="md"
          @click="rotateIcon">
        </q-icon>        
        <hr v-if="type==='public'" ></hr>
        <li>
          <RouterLink v-if="type==='member'" to="/member/user" tabindex="-1">
            <img v-if="url" class="avatar" :src="url" alt='avatar'>
            <div v-if="!url" class="avatar">
              <q-icon  class='avatar' name="account_circle" ></q-icon>
            </div>
            <Tooltip :tt_text="$t('comps.header.settings-ico.tip')"></Tooltip>
          </RouterLink>
        </li>
        <hr v-if="type==='member'" ></hr>
        <li v-for="(item, idx) in roleFilteredItems" :key="idx">
          <NavBarItem 
            :key="roleFilteredItems"
            :item="item" 
            :isRotated="isRotated" 
            :screen="850"
          />
        </li>

      </ul>
    </nav>
</template>

<style scoped>
  nav {
    width: 250px;
    min-height: 100%;
    background-color:var(--blue-navbar);    
    border: 1px solid #ddd;
    transition: width 0.6s ease;
  }
  nav.public hr {
    border-color: transparent;
    border-width: 5px;
  }
  nav.folded {
    width:95px;
  }
  nav.public.folded {
    width: 60px;
  }
  .btn-fold {
    position:absolute;
    right:0;
    color:var(--orange);
    width:40px;
    height:30px;
    border-radius: 5px;
    background-color: red;
    display:flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    z-index:5000;
  }
  nav:not(.folded) .q-icon.btn-fold { 
    transform: rotate(0deg);
    transition: rotate 0.6s ease;
  }
  nav.folded .q-icon.btn-fold {
    transform: rotate(-180deg);
  }
  a.router-link-active img.avatar {
    border:solid 3px var(--orange);
  }
  div.avatar {    
    display:flex;
    justify-content: center;
    align-items: center;
    width:80px;
    height:80px;
    margin:0 auto;
    overflow: hidden;
  }
  .q-icon.avatar {
    color:var(--orange);
    font-size:8rem;
    cursor: pointer;
  }
  a.router-link-active div.avatar {   
    border:solid 3px var(--orange);
    border-radius: 50%;    
  }
  hr {
    width:100%;
  }
  ul { 
    position: relative;
    display:flex;
    flex-direction: column;
    list-style: none;
    padding: 0;
    margin: 0;
    font-size: 1.8rem;
  }
  nav.folded li {
    text-align: center;
  }
  li {
    padding: 3px 10px;
    width:100%;
  }
  li:has(img,.q-icon.avatar) {
    margin: 1rem auto;
    margin-bottom:0;
    text-align: center;
    padding:0;
  }
  img {
    border-radius: 50%;
    width:80px;
    height:80px;
    object-fit: cover;
    cursor: pointer;
  }
</style>
