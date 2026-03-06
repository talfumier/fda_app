<script setup>
  import { ref } from 'vue'
  import _ from 'lodash'
  import public_items from './nav-items-public.json'
  import NavBarItem from './NavBarItem.vue'
  
  const props = defineProps({
    type:{type:String},
    wrap:{type:Boolean,default:false}
  })  

  const isRotated=ref(false)

  const mediaQuery = window.matchMedia("(max-width: 730px)")
  function handleScreenChange(e) {
    isRotated.value=e.matches
  }
  mediaQuery.addEventListener("change", handleScreenChange)
  handleScreenChange(mediaQuery) // run initially
 
</script>

<template>
    <nav >
      <ul>        
        <li v-for="(item, idx) in public_items" :key="idx">
          <NavBarItem 
            :key="item"
            source='public'
            :item="item" 
            :isRotated="isRotated" 
          />
        </li>

      </ul>
    </nav>
</template>

<style scoped>
  nav {
    width: fit-content;
    height: 100%;
    background-color:var(--white);   
    border: 1px solid #ddd;
    transition: width 0.6s ease;
    grid-row:2;
    grid-column: 1/span2;
    padding:0 20px;
  }
  
  hr {
    width:100%;
  }
  ul { 
    position: relative;
    display:flex;
    list-style: none;
    padding: 0;
    margin: 0;
    font-size: 1.8rem;
  }
  li {
    padding: 0px 5px;
  }
  @media screen and (min-width: 730px) {
    li {
      padding: 3px 5px;
    }
  }
</style>
