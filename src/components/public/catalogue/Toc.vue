<script setup>  
  import { ref,watch, nextTick } from 'vue'
  import { scrollToSection } from './functions'

  const props=defineProps({
    domain_artists:{type:Object},
    past:{type:Boolean}
  })

  const search=ref(null)
  watch(   
    () => search.value,              // <-- getter function required for primitive value
    (v) => { 
      if(!v) {
        scrollToSection('top-catalogue')
        return
      }
      for(const domain of Object.keys(props.domain_artists)) {
        let result=null
        result=props.domain_artists[domain].artists.find((artist) => {
          return artist.artist.toLowerCase().includes(v.toLowerCase())
        })  
        if(result) {  
          scrollToSection(`artist${result.idUser}`)
          break
        }
      }
    },
    { immediate: false }
  )

  const emit = defineEmits(['expand','closeMenu'])

  function toggle(domain){
    emit('expand',domain)
  } 
  async function handleMenuClick(id) {
    emit('closeMenu') 
    setTimeout(() => {
      scrollToSection(`artist${id}`) 
    },100)
  }

</script>

<template>
  <nav :class="['toc',past?'past':'']">
    <ul class="search">
      <q-input
          dense
          filled
          debounce="300"
          v-model="search"
          :placeholder="$t('common.search')"
          hide-bottom-space
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
          <template v-slot:append>
            <q-icon name="cancel" @click="search=''" class="cursor-pointer" />
          </template>
      </q-input> 
      <i class="fa-solid fa-arrow-up" @click="scrollToSection('top-catalogue')"></i>
    </ul>
    <ul v-for="(domain,idx) in Object.keys(domain_artists)" :key="domain">
      <li :class="['domain',idx===0?'guest':'']" 
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
          @click="handleMenuClick(da.idUser)"
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
    top: 0;
    min-width:250px;
    max-width:250px;
    max-height:550px;
    overflow-x: hidden;
    overflow-y: auto;
    font-family: "Roboto", sans-serif;
    font-size: 1.5rem;
  }
  nav.toc.past {
    top:0;
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
  ul.search {
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-between;
    align-items: center;
    gap:10px;
    padding:10px 5px;
  }
  nav.toc.past ul.search {
    /* padding-top:50px; */
    margin-left: 10px;
  }
  ul.search i {
    cursor: pointer;
    font-size: 25px;
    opacity: 0.9;
    padding-right:5px;
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
  li.domain.guest::after { 
    content: "\f0a3 ";
    font-family: "Font Awesome 6 Free";
    font-style: normal; 
    font-size: 1.5rem;
    font-weight: 900;
    color:red;
    padding-left:5px;
    opacity:0.9;
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