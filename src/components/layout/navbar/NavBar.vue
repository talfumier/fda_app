<script setup>
  import { ref,inject,computed, onMounted, onUnmounted } from 'vue';
  import _ from 'lodash'
  import Tooltip from '../../common/Tooltip.vue';
  import items from "./nav-items.json"
  import NavBarItem from './NavBarItem.vue';
  import { getEntitiesBySql } from '@/services/httpEntities.js';
  
  defineProps({
    wrap:{type:Boolean,default:false}
  })
  const url=ref(null)
  const isRotated = ref(false)
  function rotateIcon() {
    isRotated.value=!isRotated.value
  }
  const {token,decoded} = inject('userCookie')
  const roleFilteredItems=computed(() => {
    return _.filter(items,(item) => {
      return decoded.value.idRole?item.roles.includes(decoded.value.idRole):false
    })
  })
  const ctrl=new AbortController()  
  let alive = true // guard against updates after unmount
  onMounted(async() => {
    if(!alive) return
    const {data:res}=await getEntitiesBySql(
      'avatar',
      ':idUser', 
      decoded.value.idUser,
      token.value,
      ctrl.signal
    )
    if(res.statusCode===200) {
      url.value=res.data[0][0]?.url
    }
  })
  onUnmounted(() => { // clean-up code after component has unmounted
    alive=false
    ctrl.abort()
  }) 
</script>

<template>
    <nav :class="[isRotated?'folded':'']">
      <ul>
        <q-icon 
          class="btn-fold" 
          name="keyboard_double_arrow_left" 
          size="md"
          @click="rotateIcon">
        </q-icon>
        <li>
          <RouterLink to="/member/user" tabindex="-1">
            <img v-if="url" class="avatar" :src="url" alt="'avatar'">
            <div v-if="!url" class="avatar">
              <q-icon  class='avatar' name="account_circle" ></q-icon>
            </div>
            <Tooltip :tt_text="$t('comps.header.settings-ico.tip')"></Tooltip>
          </RouterLink>
        </li>
        <hr></hr>
        <li v-for="(item, idx) in roleFilteredItems" :key="idx">
          <NavBarItem 
            :url="item.url" 
            :icon="item.icon" 
            :isRotated="isRotated" 
            :text="'comps.navbar.'+item.text" 
            :wrap="item.wrap"/>
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
  nav.folded {
    width:95px;
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
