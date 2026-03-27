<script setup>
  import {ref,computed,inject,useSlots} from 'vue'
  import { useRoute,useRouter,RouterLink} from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { setUpTokenExpiry } from '../login/tokenExpiry.js'
  import HeaderMember from './header/HeaderMember.vue'
  import LangSwitcher from './header/LangSwitcher.vue'
  import NavBarPublic from './navbar/NavBarPublic.vue'
  import NavBarMember from './navbar/NavBarMember.vue'

  const route=useRoute()
  const router=useRouter()

  const {locale:i18nLocale,t}=useI18n()
	const locale = computed(() => {
	  return route.params?.locale || i18nLocale.value
	})

  const {decoded} = inject('userCookie')
  // handling the case where a user has closed the app without actual log-out
  // and reopen the app with a still valid token  
  if(decoded.value) setUpTokenExpiry(t, decoded.value?.exp, router)

  const slots = useSlots()
  const preferred=ref(null)
  function handlePreferred(lang) {
    preferred.value=lang
  }

</script>

<template>
  <div :class="`layout ${route.name?.includes('member')?'member':'public'}`">
    <header>
      <RouterLink :to="`/${locale}/home`" tabindex="-1">
        <img src="../../assets/images/logoFda.png" alt="Festival des Arts" class="logo"/>
      </RouterLink>
      <div class="container">
        <h1>
          <span class="span-lh">Festival des Arts</span>
          <span class="span-rh">Merville</span>
        </h1>
        <div class="container-public-member">
          <LangSwitcher v-if="$q.screen.width>=655"
            :key="preferred"
            :preferred="preferred"
          >
          </LangSwitcher>
          <HeaderMember
            @lang="handlePreferred"
          >
          </HeaderMember>
        </div>
      </div>
    </header>
    <aside v-if="route.name?.includes('member')">
      <Transition name="fade">
        <NavBarMember ></NavBarMember>
      </Transition>
    </aside>
    <NavBarPublic v-if="route.name?.includes('public')"></NavBarPublic>
    <main class="master">
      <router-view 
        :key="$route.fullPath"
      >
      </router-view>
    </main>
    <footer v-if="slots.footer">
      <slot name="footer"></slot>
    </footer>
  </div>
</template>

<style scoped>
  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.6s ease;
  }
  .fade-enter-from, .fade-leave-to {
    opacity: 0;
  }
  div.layout {
    display: grid;
    grid-template-columns: auto 1fr;
    height:100vh;
  }
  div.layout.member {
    grid-template-rows: 70px 1fr 50px;
  }
  div.layout.public {
    grid-template-rows: 70px 30px 1fr 50px;
  }  
  div.layout:has(.page-not-found) {
    grid-template-rows: 70px auto 1fr 50px;
  }
  header { 
    grid-column: span 2;
    position:relative;
    display: flex;
    justify-content:space-around;
    align-items: center;
    background-color: var(--green);
    border: solid #ddd;
    border-width:0 1px;
    border-radius: 8px 8px 0 0;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    height:70px;
    font: Berlin Sans FB;
    text-align: center; 
  }
  header .logo {
    position: absolute;
    top:0px;
    left:0px;
    height: 72px;
    border-radius: 8px 0 0 0;
  } 
  .container {
    display:flex;
    justify-content:space-between;
    align-items: center;
    width:calc(100% - 112px);
    padding:0px;
  } 
  h1 {
    display:flex;
    flex-wrap: wrap;
    justify-content: left;
    font-size: 3rem;
    padding: 0;
    font-family: 'Berlin Sans FB', Arial;
    margin:0;
  } 
  .span-lh {
    color:var(--orange);
    text-wrap: nowrap;
  }
  .span-rh {
    color:var(--white);
    display:none;
  }
  .container-public-member {
    display:flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items:center;  
    justify-content:flex-end;
    gap: 3px;
  }
  main.master {
    position:relative;
    font-family: "Roboto", sans-serif;
    background-color: var(--grey-light);
    height:100%;
    overflow-y:auto;
    /* background-color: red; */
  }
  div.layout.public main.master {
    grid-row: 3;
    grid-column: 1/span 2;
  }
  footer {  
    grid-column: span 2;
    height:50px;
  }
  div.layout.public footer {
    grid-row:4;
  }
  @media screen and (min-width: 470px) {
    h1 {      
      font-size: 4rem;
      padding:0 20px;
    }
    .span-lh {
      padding-right:20px;}
    }
  @media screen and (min-width: 600px) {
    .container {
      width:calc(100% - 132px);
    }
  }  
  @media screen and (min-width: 730px) {
    div.layout.member {
      grid-template-rows: 130px 1fr 50px;
    }
    div.layout.public {
      grid-template-rows: 130px 40px 1fr 50px;
    }   
    div.layout:has(.page-not-found) {
      grid-template-rows: 130px auto 1fr 50px;
    }
    header {
      height:130px;
    }
    header .logo {
      height: 132px;
    } 
    .span-rh {
      display:block;
    }
    .container {
      padding:0 20px;
    }
  }
  @media screen and (min-width: 1100px) {
    h1 {    
      font-size: 4.5rem;   
    }
  } 
  @media screen and (min-width: 1200px) {
    h1 {    
      font-size: 6rem;   
    }
    .container {
      padding-left:50px;
    }
  } 
  @media screen and (min-width: 1300px) {
    .container {
      padding-left:80px;
    }
    .container-public-member{
      gap: 20px;
    }
  }
</style>