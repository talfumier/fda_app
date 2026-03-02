<script setup>  
  import { useI18n } from 'vue-i18n'
  import _ from 'lodash'
  import { getText,getDim,getPrice,adjustImage,toSentenceCase,getSocialBrand } from './functions'

  const props=defineProps({
    data:{type:Object}
  })

  const {t,locale}=useI18n() 
  
</script>

<template>
  <section class="artist" :id="`artist${data.idUser}`">
    <hr>
    <div class="bio">
      <h3 class="technique">{{getText(2,data.domain,null,locale)}}</h3>
      <h4 class="avatar">
        <img v-if="data.public_image && data.u_url":src="adjustImage(70,70,data.u_url)" alt="data.artistname" loading="lazy">
        <p>{{ data.artist }}&nbsp &nbsp{{ data.public_pseudo && data.pseudo!==data.artist && data.pseudo?"'"+data.pseudo+"'":'' }}</p>
      </h4>
      <div class="contact">
        <p v-if="data.public_email" class="mail">
          <a :href="`mailto:${data.email}`">{{data.email}}</a>
        </p>
        <p v-if="data.public_phone" class="phone">{{ data.phone }}</p>
      </div>
      <div class="social">
        <p v-if="data.social1 && data.social1.startsWith('https')"
          :class="getSocialBrand(data.social1)"
        >
          <a :href="data.social1" target="_blank" rel="noopener" >
            {{ data.social1 }}
          </a>
        </p>
        <p v-if="data.social2 && data.social2.startsWith('https')"
          :class="getSocialBrand(data.social2)"
        >
          <a :href="data.social2" target="_blank" rel="noopener">
            {{ data.social2 }}
          </a>
        </p>
      </div>
      <div class="web">
        <p v-if="data.web1 && data.web1.startsWith('https')">
          <a :href="data.web1" target="_blank" rel="noopener">
            {{ data.web1 }}
          </a>
        </p>
        <p v-if="data.web2 && data.web2.startsWith('https')">
          <a :href="data.web2" target="_blank" rel="noopener">
            {{ data.web2 }}
          </a>
        </p>
      </div>
      <div class="resume" v-if="data[`resume_${locale}`]">{{ toSentenceCase(2,data[`resume_${locale}`] )}}</div>
    </div>
    <div class="works">
      <div v-for="bo in data.bookingOeuvres" class="work">
        <img :src="adjustImage(300,300,bo.o_url)" :alt="getText(1,bo,'title')" >
        <div class="details">
          <p class="title">{{toSentenceCase(1,getText(1,bo,'title',locale))}}</p>
          <p class="desc">{{toSentenceCase(2,getText(1,bo,'desc',locale))}}</p>
          <p class="technique-media">Technique: {{getText(1,bo,'tech',locale)}} | Support: {{getText(1,bo,'media',locale)}}</p>
          <p class="dim">{{ getDim(bo,locale) }}</p>
          <p class="price">{{ getPrice(bo,t) }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
  section {
    display:flex;
    flex-direction: column;
    align-items: center;
    padding:0 15px;
    width:100%;    
    font-family: "Roboto", sans-serif;
    font-size: 1.5rem;
  }
  div.bio {
    display:flex;
    flex-direction: column;
    align-items: center;
  }
  h3,h4 {  
    margin:0;
  }
  h3.technique {  
    font-family: Berlin Sans FB;
    font-size: 2.1rem;
  }
  h4.avatar {    
    font-family: Berlin Sans FB Bold;
    font-size: 2.2rem;
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    gap:20px;
    margin:10px 0;
  }  
  h4.avatar img {
    width:70px;
    height:70px;
    object-fit: cover;
  }
  div.contact {
    display:flex;
    flex-wrap: nowrap;
    gap:10px;
    padding:5px;
  }
  p {
    margin:0;
    display:flex;
    line-height: 20px;
  }
  p.mail,p.phone {
    display:flex;
    flex-wrap: wrap;
    align-items: center;
  }
  p.mail::before { 
    content: "\f0e0 ";
    font-family: "Font Awesome 6 Free";
    font-style: normal; 
    font-size: 2rem;
    font-weight: 900;
    padding-right: 10px;
    opacity:0.5;
  }
  p.phone::before {
    content: "\f095";
    font-family: "Font Awesome 6 Free";
    font-style: normal; 
    font-size: 1.8rem;
    font-weight: 900;
    padding-right: 5px;
    opacity:0.5;
  }
  div.social,div.web {
    display:flex;
    flex-wrap: wrap;
    justify-content: center;
    max-width: 650px;
  }
  div.social a,div.web a {
    padding:2px 5px;
  }
  div.web p::before {
    content: "\f0ac";
    font-family: "Font Awesome 6 Free";
    font-style: normal; 
    font-size: 2rem;
    font-weight: 900;
    padding: 2px 5px 0 5px;
    opacity:0.5;
  }
  div.social p.insta::before {
    content: "\f16d";
    font-family: "Font Awesome 6 Brands";
    font-style: normal;
    font-weight: 400; 
    font-size: 2.2rem;
    padding: 2px 5px 0 5px;
    /* opacity: 0.5; */
  }
  div.social p.fb::before {
    content: "\f09a";
    font-family: "Font Awesome 6 Brands";
    font-style: normal;
    font-size: 2rem;
    font-weight: 400; 
    padding: 2px 5px 0 5px;
    opacity:0.6;
  }
  div.social p.x::before {
    content: "\e61b";
    font-family: "Font Awesome 6 Brands";
    font-style: normal;
    font-weight: 400; 
    font-size: 1.8rem;
    padding: 2px 3px 0 8px;
    /* opacity:0.5; */
  }
  div.resume {   
    text-align: justify;
    margin: 10px 0;
    max-width:650px;
  }
  hr {
    border-color: var(--grey);
    border-width: 1px;
    width:100%;
  }
  div.works {
    display:flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap:20px;
    padding:15px;
  }
  div.work {
    max-width: 300px;
  }
  p.technique-media, p.dim, p.price {
    padding-top:5px;
  }
</style>