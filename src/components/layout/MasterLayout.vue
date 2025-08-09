<script setup>
import { useSlots } from 'vue'
import HeaderMember from './HeaderMember.vue'
import LangSwitcher from './LangSwitcher.vue';

const {loggedIn}=defineProps({
  loggedIn:Boolean
})
const slots = useSlots()
</script>

<template>
  <div class="layout">
    <header>
      <img src="../../assets/images/logoFda.png" alt="Festival des Arts" class="logo" />
      <div class="container">
        <h1 >
          <span class="span-lh"style="color:#fcb414;">Festival des Arts</span>
          <span class="span-rh">Merville</span>
        </h1>
        <div class="container-lang-icons">
          <LangSwitcher ></LangSwitcher>
          <HeaderMember :loggedIn="loggedIn" ></HeaderMember>
        </div>
      </div>
    </header>
    <main>
      <router-view ></router-view>
    </main>
    <footer v-if="slots.footer">
      <slot name="footer"></slot>
    </footer>
  </div>
</template>

<style scoped>
  header { 
    position:relative;
    display: flex;
    justify-content:space-around;
    align-items: center;
    background-color: var(--green);
    border: 1px solid #ddd;
    border-radius: 8px 8px 0 0;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    height:130px;
    font: Berlin Sans FB;
    text-align: center; 
    min-width:525px;
  }
 .logo {
    position: absolute;
    left: 10px;
    max-height: 75%;
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
  .container-lang-icons {
    display:flex;
    flex-direction: column;
    align-items:center;  
    justify-content: center;
    gap: 20px;
  }
  div.layout {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr auto;
    min-height:100vh;
    min-width:525px;
  }
  main {
    font-family: "Roboto", sans-serif;
    background-color: var(--grey-light);
    overflow-y:auto;
  }
  footer {    
    min-width:525px;
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
  @media screen and (min-width: 1300px) {
    .container-lang-icons {
      flex-direction: row;
      gap: 20px;
      padding-right: 40px;
    }
  }
</style>