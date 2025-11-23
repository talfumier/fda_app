<script setup>
  import { truncate } from '@/utilityFunctions.js'

  const props=defineProps({
    links:{type:Object}
  })

  function getSocialIcon(link) {
    const socials = [
      { link: 'x.com', icon: 'x-twitter' },
      { link: 'instagram.com', icon: 'instagram' },
      { link: 'facebook.com', icon: 'facebook' },
      { link: 'linkedin.com', icon: 'linkedin' },
    ]
    const path = '../../../assets/icons'
    const match = socials.find((item) => link?.toLowerCase().includes(item.link))
    if (!match) return null
    return new URL(`${path}/${match.icon}.svg`, import.meta.url).href
  }

</script>

<template>
  <div class='web'>
    <ul v-if="links.web1 || links.web2" class="web"> 
      <li><a :href="links.web1">{{ truncate(links.web1,30) }}</a></li>
      <li><a :href="links.web2">{{ truncate(links.web2,30)}}</a></li>
    </ul>
    <ul v-if="links.social1 || links.social2" class="social"> 
      <li><a v-if="links.social1" :href="links.social1"><img :src="getSocialIcon(links.social1)" alt="Social icon" ></a></li>
      <li><a v-if="links.social2" :href="links.social2"><img :src="getSocialIcon(links.social2)" alt="Social icon" ></a></li>
    </ul>
  </div>  

</template>

<style scoped>
  div.web {
    display:flex;
    flex-wrap: nowrap;  
    border-top: 1px solid var(--blue);  
  }
  div.web:has(ul) {
    border-bottom: 1px solid var(--blue);
  }
  ul {
    display:flex;
    flex-direction: column;
    justify-content:flex-start;
    list-style-type: none;
    padding:0 15px 0 10px;
    margin:0;
  }
  div.web:has(ul.social) ul {
    border-right: 1px solid var(--blue);
  }
  div.web:has(ul.social) ul.social {
    flex-direction: row;
    padding:5px;
    margin:0;
    border:none;
  }  
  li {
    display:flex;
    align-items: flex-start;
    line-height: 2.4rem;
  }
  img {
    width: 25px;
    height: 25px;
    margin-right: 10px;
    cursor: pointer;
  }

</style>