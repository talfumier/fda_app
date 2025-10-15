<script setup>
  import {ref,inject,useSlots} from 'vue'
  import { useRouter,useRoute,RouterLink } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  import { setUpTokenExpiry } from '../login/tokenExpiry.js';
  import HeaderMember from './header/HeaderMember.vue'
  import LangSwitcher from './header/LangSwitcher.vue';
  import NavBar from './navbar/NavBar.vue';
  
  const route=useRoute()
  const router=useRouter()
  const {t}=useI18n()
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
  <div class="layout">
    <header>
      <RouterLink to="/public/home" tabindex="-1">
        <img src="../../assets/images/logoFda.png" alt="Festival des Arts" class="logo"/>
      </RouterLink>
      <div class="container">
        <h1 >
          <span class="span-lh"style="color:#fcb414;">Festival des Arts</span>
          <span class="span-rh">Merville</span>
        </h1>
        <div class="container-public-member">
          <LangSwitcher 
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
    <aside>
      <Transition v-if="route.name?.includes('member')" name="fade">
        <NavBar ></NavBar>
      </Transition>
    </aside>
    <main>
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
    grid-template-rows: 130px calc(100vh - 180px) 50px;
    grid-template-columns: auto 1fr;
    height:100%;
    min-width:525px;
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
    height:130px;
    font: Berlin Sans FB;
    text-align: center; 
    min-width:525px;
  }
 .logo {
    position: absolute;
    top:0px;
    margin-left:-29px;
    height: 132px;
  } 
  .container {
    display:flex;
    justify-content:space-between;
    align-items: center;
    position:absolute;
    left:60px;
    width:calc(100% - 60px);
    padding:0 20px;
  } 
  h1 {
    font-size: 4rem;
    margin:0;
    padding-right: 20px;
    font-family: 'Berlin Sans FB', Arial;
  }
  .span-lh {
    color:var(--orange);
  }
  .span-rh {
    padding:0 0 0 30px;
    color:var(--white);
  }
  .container-public-member {
    display:flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items:center;  
    justify-content:flex-start;
    gap: 3px;
  }
  main {
    font-family: "Roboto", sans-serif;
    background-color: var(--grey-light);
    overflow-y:auto;
  }
  footer {    
    grid-column: span 2;
    min-width:525px;
    height:50px;
  }
  @media screen and (min-width: 600px) {
    .logo {
      left:30px;
    }
    .container {
      left:100px;
      width:calc(100% - 100px);
    }
  }
  @media screen and (min-width: 1000px) {
    h1 {    
      font-size: 5rem;   
    }
  }
  @media screen and (min-width: 1100px) {
    h1 {    
      font-size: 6rem;   
    }
    .container {
      left:140px;
      width:calc(100% - 140px);
    }
  } 
  @media screen and (min-width: 830px) {
    .container-public-member{
      flex-wrap: nowrap;      
    }
  } 
  @media screen and (min-width: 1300px) {
    .container-public-member{
      /* flex-direction: row; */
      gap: 20px;
      padding-right: 40px;
    }
  }
</style>