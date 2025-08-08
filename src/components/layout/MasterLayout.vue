<script setup>
import HeaderMember from './HeaderMember.vue'
import { useSlots } from 'vue'

const {loggedIn}=defineProps({
  loggedIn:Boolean
})
const slots = useSlots()
</script>

<template>
  <header class="centered-box">
    <img src="../../assets/images/logoFda.png" alt="Festival des Arts" class="logo" />
    <h1 >
      <span class="span-lh"style="color:#fcb414;">Festival des Arts</span>
      <span class="span-rh">Merville</span>
    </h1>
    <HeaderMember :loggedIn="loggedIn"></HeaderMember>
  </header>
  <div class="wrapper">
    <router-view></router-view>
    <footer v-if="slots.footer">
      <slot name="footer"></slot>
    </footer>
  </div>

</template>

<style scoped>
  .centered-box {
    padding: 20px 40px;
    background-color: var(--green);
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    /* min-height: 115px; */
    height:fit-content;
    font: Berlin Sans FB;
    font-size: 1.6rem;
    text-align: center;
  }
 .logo {
    position: absolute;
    top: 0px;
    left: 20px;
    padding: 20px 0px;
    height: 130px; /* adjust as needed */
  }  
  h1 {
    font-size: 6rem;
    margin:0;
  }
  .span-lh {
    color:var(--orange);
  }
  .span-rh {
    padding:0 0 0 30px;
    color:var(--white);
  }
</style>