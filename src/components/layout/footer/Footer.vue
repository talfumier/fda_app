<script setup>
  import items from "./items.json"
  import NavBarItem from "../navbar/NavBarItem.vue";

  defineProps({
  })

</script>

<template>
  <ul>
    <li class="lh"><img src="../../../assets/images/logo-mairie.png" alt="logo mairie de Merville"></li>
    <li v-for="(item, idx) in items" :key="idx">
      <NavBarItem 
        :key="item"
        :item="item"
        source='footer'
      />
    </li>
    <li class="rh">
      <p>©&nbsp;</p>2025<p></p><p class="q-pl-sm">ht&nbsp; consultant</p>
    </li>
  </ul>
</template>

<style scoped>
  ul {
    display:flex;
    justify-content:center;
    align-items: center;
    background-color: var(--black);
    font-family: 'Berlin Sans FB', Arial;
    font-size: 2rem;
    list-style: none; /* removes bullets */
    padding: 10px 20px;
    margin:0;
    gap:30px;
    height:100%;
  }  
  li {
    display: inline-block;
    cursor: pointer;
  }  
  li.lh,li.rh {
    position:absolute;
    font-family: "Roboto", sans-serif;
    font-size: 1.5rem;
    color:var(--white);
    display:none;
  }
  img {
    width:70px;
    height:calc(100% - 10px);
    padding-top: 5px;
  }
  p {
    display: inline-block;
    line-height: 25px;
    margin:0;
  }
   /* a {
    color: var(--orange);
  } */
  @media screen and (min-width: 600px) {
    ul {
      gap:60px;
    }
  }
  @media screen and (min-width: 800px) {
    li.lh {
      display:block;
      left:20px;
    }
  }
  @media screen and (min-width: 1000px) {
    li.rh {
      display:block;
      right:25px;
    }
  }
</style>