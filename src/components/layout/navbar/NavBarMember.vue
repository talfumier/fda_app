<script setup>
  import { ref,inject,computed, onMounted, onUnmounted } from 'vue'  
  import _ from 'lodash'
  import { environment } from '@/config/environment.js'
  import Tooltip from '../../common/Tooltip.vue'
  import member_items from "./nav-items-member.json"
  import NavBarItem from './NavBarItem.vue'
  import { getEntitiesBySql } from '@/services/httpEntities.js'
  
  const props = defineProps({
    wrap:{type:Boolean,default:false}
  })  
  
  const url=ref(null)
  const isRotated = ref(false)
  function rotateIcon() {
    isRotated.value=!isRotated.value
  }
  const {token,decoded} = inject('userCookie')
  const roleFilteredItems=computed(() => {
    return _.filter(member_items,(item) => {
      if(decoded.value.idRole===7 && item['dev-test']) return !environment.production
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
  const ctrl=new AbortController()  
  onMounted(async() => {
    await fetch(ctrl.signal)
  })
  onUnmounted(() => { // clean-up code after component has unmounted
    ctrl.abort()
  }) 
</script>

<template>
    <nav :class="[isRotated || $q.screen.width<=850?'folded':'']">
      <ul>
        <q-icon v-if="$q.screen.width>850"
          class="btn-fold" 
          name="keyboard_double_arrow_left" 
          size="md"
          @click="rotateIcon">
        </q-icon>  
        <li class="avatar">
          <RouterLink to="/member/user" tabindex="-1">
            <div class="avatar">
              <img v-if="url" class="avatar" :src="url" alt='avatar'>
              <q-icon  v-else class='avatar' name="account_circle" ></q-icon>
            </div>
            <Tooltip :tt_text="$t('comps.header.settings-ico.tip')"></Tooltip>
          </RouterLink>
        <hr class="avatar"></hr>
        </li>
        <li v-for="(item, idx) in roleFilteredItems" :key="idx">
          <NavBarItem 
            :key="roleFilteredItems"
            source='member'
            :item="item" 
            :isRotated="isRotated || $q.screen.width<=850" 
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
  nav.folded {
    padding-top: 50px;
    width:50px;
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
  a.router-link-active div.avatar {
    border:solid 3px var(--orange);
  } 
  div.avatar {    
    display:none;
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
    display:none;
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
  @media screen and (min-width: 500px) {  
    nav.folded {
      padding-top: 0;
      width:95px;
    }     
    div.avatar {
      display:flex;
      justify-content: center;
      align-items: center;
      width:80px;
      height:80px;
      overflow: hidden;
      border:none;
      margin:10px auto 0;
    }
    hr {
      display:block;
    }
    
  } 
</style>
