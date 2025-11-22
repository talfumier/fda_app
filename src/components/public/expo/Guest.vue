<script setup>
  import {onMounted, ref} from 'vue'
  import { useI18n } from 'vue-i18n'
  import _ from 'lodash'
  import { truncate,getSocialIcon } from '@/utilityFunctions.js'
  import Carousel from './Carousel.vue'

  const props=defineProps({
    data:{type:Array}
  })
  
  const {locale}=useI18n() 
  const state=ref([]) 
  const fields={
        guest:['idUser','firstName','lastName','public_name','pseudo','public_pseudo','email','public_email','phone','public_phone','resume_fr','resume_en','public_image','web1','web2','social1','social2','avatarFileName','avatarUrl'],
        oeuvres:['idOeuvre','title_fr','title_en','desc_fr','desc_en','fileName','url']
      }
  function getGroup(row){
    const group={}
    fields.guest.map((field) => {
      group[field]=row[field]      
    })
    group.oeuvres=[]
    return group
  }
  function getItem(row){
    const item={}
    fields.oeuvres.map((field) => {
      item[field]=row[field]
    })
    return item
  }
  onMounted(() => {
    const groupsById = {}      
    props.data.forEach(row => {
      const id = row.idUser
      if (!groupsById[id]) 
        groupsById[id] = getGroup(row)
      groupsById[id].oeuvres.push(getItem(row))
    })
    state.value=Object.values(groupsById)
  })

</script>

<template>
  <section class="guest" :key="guest.idUser" v-for="guest in state">
    <aside>
      <div class="personalia">
        <div v-if="guest.public_image && guest.avatarUrl" class="avatar">
          <img class='avatar':src="guest.avatarUrl" :alt="`${guest.lastName} avatar`">
        </div>
        <ul class="guest">
          <li class='name'>{{guest.lastName.toUpperCase() }}&nbsp;{{ _.capitalize(guest.firstName) }}</li>    
          <li v-if="guest.public_pseudo && guest.pseudo" class="pseudo">{{ guest.pseudo }}</li>
          <li class='mail' v-if="guest.public_email"><a :href="`mailto:${guest.email}`">{{ guest.email }}</a></li>
          <li class='phone' v-if="guest.public_phone && guest.phone">{{ guest.phone }}</li>
        </ul>
      </div>
      <div class='web'>
        <ul v-if="guest.web1 || guest.web2" class="guest web"> 
          <li><a :href="guest.web1">{{ truncate(guest.web1,30) }}</a></li>
          <li><a :href="guest.web2">{{ truncate(guest.web2,30)}}</a></li>
        </ul>
        <ul v-if="guest.social1 || guest.social2" class="social"> 
          <li><a v-if="guest.social1" :href="guest.social1"><img :src="getSocialIcon(guest.social1)" alt="Social icon" ></a></li>
          <li><a v-if="guest.social2" :href="guest.social2"><img :src="getSocialIcon(guest.social2)" alt="Social icon" ></a></li>
        </ul>
      </div>  
      <div class="resume">{{ guest[`resume_${locale}`] }}
      </div>
    </aside>
    <main class="photos">
      <Carousel :data="guest.oeuvres">
      </Carousel>
    </main>
  </section>

</template>

<style scoped>
  section {
    display:flex;
    flex-direction: column; 
    font-size: 1.5rem;
    border:solid 2px #0042A4;
    border-radius: 5px;
    font-family: 'Roboto', sans-serif; 
    max-width: 700px;
    margin:10px;
    width:100%;
  }
  aside {
    display:flex;
    flex-direction: column;
    padding-bottom: 10px;
  }
  div.personalia {
    display:grid;
    grid-template-rows: 110px;
    grid-template-columns:80px auto ;
  }
  ul.guest {
    display:flex;
    flex-direction: column;
    justify-content:flex-start;
    list-style-type: none;
    padding:0 15px 0 10px;
    margin:0;
  }
  ul.guest.web {
    border-right: 1px solid #0042A4;
  }
  ul.social {
    flex-direction: row;
    flex-wrap: nowrap;
    padding:5px;
    margin:0;
  }
  li {
    display:flex;
    align-items: flex-start;
    line-height: 2.4rem;
  }
  li.name {
    font-weight: bolder;
    opacity:0.8;
  }
  li.pseudo {
    font-style: italic;
    color:var(--orange);
    font-weight: bolder;
  }
  li.mail::before { 
    content: "\2709 ";
    font-style: normal; 
    font-size: 2.5rem;
    padding-right: 10px;
  }
  li.phone::before {
    content: "\2706 ";
    font-style: normal; 
    font-size: 2.5rem;
    padding-right: 10px;
  }
  div.avatar { 
    display:flex;
    align-items: top;
    justify-content: center;
  }
  img.avatar {
    width: 80px;
    height:100px;
    padding:5px;
    border:1px solid lightgrey;
  }
  div.web {
    display:flex;
    flex-wrap: nowrap;  
    border-top: 1px solid #0042A4;  
  }
  div.web:has(ul) {
    border-bottom: 1px solid #0042A4;
  }
  div.resume {
    padding:10px 15px;
    text-align: justify;
    height:150px;
    overflow-y: auto;
    width:100%;
  }
  main.photos {
    flex: 1 1 200px;
    display: flex; 
  }
  @media screen and (min-width: 1000px) { 
    section {
      flex-direction: row;    
      height:300px;
    }
    aside {
      width: 350px;
    }
    div.resume {
      height:100%;
    }
  } 

</style>