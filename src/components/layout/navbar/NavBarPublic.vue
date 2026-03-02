<script setup>
  import _ from 'lodash'
  import public_items from './nav-items-public.json'
  import NavBarItem from './NavBarItem.vue'
  
  const props = defineProps({
    type:{type:String},
    wrap:{type:Boolean,default:false}
  })  
 
</script>

<template>
    <nav >
      <ul>        
        <li v-for="(item, idx) in public_items" :key="idx">
          <NavBarItem 
            :key="item"
            source='public'
            :item="item" 
            :isRotated="$q.screen.width<730" 
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
    padding: 3px 5px;
  }
</style>
