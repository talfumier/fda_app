<script setup>  
  import { scrollToSection } from './functions'

  const props=defineProps({
    domain_artists:{type:Object}
  })

  const emit = defineEmits(['expand'])

  function toggle(domain){
    emit('expand',domain)
  } 

</script>

<template>
  <nav class="toc">
    <h2 @click="scrollToSection('top-catalogue')">{{ $t('comps.public_site.catalogue.toc') }}</h2>
    <ul v-for="domain in Object.keys(domain_artists)" :key="domain">
      <li class="domain"
        @click="toggle(domain)"
      >
        <q-icon
          name="keyboard_arrow_down"
          size="3rem"
          :style="`transform: rotate(${domain_artists[domain].expand ? '-180deg' : '0deg'});transition: 0.6s ease;`"
        >
        </q-icon>
        {{ domain}}
      </li>
      <ul :class="['names',domain_artists[domain].expand?'visible':'hidden']" >
        <li v-for="da in domain_artists[domain].artists" 
          class="name"
          :key="da.artist.idUser"
          @click="scrollToSection(`artist${da.idUser}`)"
          >
          {{ da.artist }}
        </li>
      </ul>
    </ul>
  </nav>
</template>

<style scoped>
  nav {
    position: sticky;
    top: 35px;
    min-width:250px;
    max-width:250px;
    max-height:550px;
    overflow-x: hidden;
    overflow-y: auto;
    font-family: "Roboto", sans-serif;
    font-size: 1.5rem;;
  }
  h2 {
    position:fixed;
    top:165px;
    font-size: 2rem;
    padding:15px 15px 10px;
    margin:0;
    line-height: 20px;
    cursor: pointer;
    font-weight: 900;
    opacity:0.5;
  }
  h2::after {
    content: "\f062";
    font-family: "Font Awesome 6 Free";
    font-style: normal; 
    font-size: 2rem;
    font-weight: 900;
    padding-left: 10px;
    opacity:0.9;
  }
  ul { 
    display:grid;
    grid-template-rows: auto;
    grid-template-columns: 30px 220px;
    align-items: left;
    list-style-type: none;
    padding: 0 15px;
    margin:0;
  }
  li {
    cursor: pointer;
  }
  li.domain {  
    grid-row: 1;
    grid-column: 1/span 2;
    font-weight: bolder;
    font-size: larger;
   
  }
  li.domain p {
    margin:0;
  }
  ul.names {
    width:250px;
  }
  ul.names.hidden {
    display:none;
  }
  li.name {
    grid-column: 1/span 2;
    line-height: 20px;
  }
  li.name:hover{ 
    text-decoration: underline; 
    color:blue;
  }  

</style>