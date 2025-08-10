<script setup>
  import { ref } from 'vue';
  import Tooltip from '../../common/Tooltip.vue';
  import items from "./nav_items.json"
  import NavBarItem from './NavBarItem.vue';
  defineProps({
    wrap:{
      type:Boolean,
      default:false
    }
  })
  const isRotated = ref(false)
  function rotateIcon() {
    isRotated.value=!isRotated.value
  }
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
          <RouterLink to="/">
            <img class="avatar" src="../../../assets/images/Egyptien.jpg" alt="avatar">
            <Tooltip :tt_text="$t('comps.header.settings-ico.tip')"></Tooltip>
          </RouterLink>
        </li>
        <hr></hr>
        <li v-for="(item, idx) in items" :key="idx">
          <NavBarItem :url="item.url" :icon="item.icon" :isRotated="isRotated" :text="'comps.navbar.'+item.text" :wrap="item.wrap"/>
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
  }
  nav:not(.folded) .q-icon.btn-fold { 
    transform: rotate(0deg);
    transition: rotate 0.6s ease;
  }
  nav.folded .q-icon.btn-fold {
    transform: rotate(-180deg);
  }
  hr {
    width:100%;
  }
  ul { 
    position: relative;
    display:flex;
    flex-direction: column;
    align-items:center;
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
  li:has(img) {
    margin: 1rem auto;
    margin-bottom:0;
    text-align: center;
    padding:0;
  }
  img.avatar {
    border-radius: 50%;
    width:80px;
    height:80px;
    object-fit: cover;
    cursor: pointer;
  }
</style>
