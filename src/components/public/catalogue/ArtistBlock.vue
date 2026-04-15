<script setup>  
  import { useI18n } from 'vue-i18n'
  import _ from 'lodash'
  import { getText,getDim,getPrice,adjustImage,toSentenceCase,getSocialBrand } from './functions'
  import LocationBadge from '@/components/common/page/details/tabs/expo/selection/LocationBadge.vue'

  const props=defineProps({
    locale:{type:String},
    data:{type:Object},
    print:{type:Boolean,default:false}
  })

  const {t}=useI18n() 
  
</script>

<template>
  <section v-if="locale" :class="['artist']" :id="`artist${data.idUser}`">
    <hr v-if="!print">
    <div class="bio">
      <h3 class="technique">{{getText(2,data.domain,null,locale)}}</h3>
      <h4 :class="['avatar',!print && data.idRole===2?'guest':'']">
        <q-badge  v-if="!print && data.idRole===2" color='positive' class='guest' :label="$t('comps.form_details.expos.tabs.guest')" /> 
        <LocationBadge v-if="print" :data="data"></LocationBadge>
        <img v-if="(!print || print && data.idRole===2) && data.public_image && data.u_url"
          :src="adjustImage(70,70,data.u_url)" :alt="data.artistname">
        <p>{{ data.artist }}&nbsp &nbsp{{ data.public_pseudo && data.pseudo!==data.artist && data.pseudo?"'"+data.pseudo+"'":'' }}</p>
      </h4>
      <div class="contact">
        <p v-if="data.public_email" class="mail">
          <a :href="`mailto:${data.email}`">{{data.email}}</a>
        </p>
        <p v-if="data.public_phone" class="phone">{{ data.phone }}</p>
      </div>
      <div v-if="!print" class="social">
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
      <div v-if="!print" class="web">
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
      <div 
        :class="['resume',print && data.idRole===2?'guest':'']" 
        v-if="(!print || print && data.idRole===2) && data[`resume_${locale}`]"
      >
        {{ toSentenceCase(2,data[`resume_${locale}`] )}}
      </div>
    </div>
    <div 
      :class="['works',print?'print':'',print && data.idRole===2?'guest':'no-guest']"
    >
      <div v-for="(bo,idx) in _.orderBy(data.bookingOeuvres,['catalogue','artist'],['desc','asc'])" class="work">
        <img v-if="print && data.idRole===2 && idx<=4 || print && idx===0 || !print" 
          :src="adjustImage(300,300,bo.o_url)" :alt="getText(1,bo,'title')">
        <div v-if="!print" class="details">
          <p class="title">{{toSentenceCase(1,getText(1,bo,'title',locale))}}</p>
          <p v-if="!print" class="desc">{{toSentenceCase(2,getText(1,bo,'desc',locale))}}</p>
          <p class="technique-media">Technique: {{getText(1,bo,'tech',locale)}} | Support: {{getText(1,bo,'media',locale)}}</p>
          <p class="dim">{{ getDim(bo,locale) }}</p>
          <p class="price">{{ getPrice(bo,t) }}</p>
        </div>
        <div v-if="print && data.idRole!==2 || print && data.idRole===2 && idx<=4" class="details">
          <span class="title">{{toSentenceCase(1,getText(1,bo,'title',locale))}}&nbsp|&nbsp</span>
          <span class="technique-media">{{_.capitalize(getText(1,bo,'tech',locale))}}&nbsp{{`${bo.price||bo.reserved?'|':''}`}}&nbsp</span>
          <span class="price">{{ getPrice(bo,t,print) }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
  section.artist {
    display:flex;
    flex-direction: column;
    align-items: center;
    padding:0;
    width:100%;    
    font-family: "Roboto", sans-serif;
    font-size: 1.5rem;
    margin-top:15px;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  div.bio {
    display: flex;
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
    flex-wrap: wrap;
    align-items: center;
    gap:10px;
    margin:10px 0;
  }  
  h4.avatar .q-badge {    
    font-family: "Roboto", sans-serif;
    font-size: 12px;
    font-weight: 400;
    max-width:70px;
    white-space: normal;
    text-align: center;
    line-height: 15px;
    display: flex;
    justify-content: center;
  }
  h4.avatar img {
    width:70px;
    height:70px;
    object-fit: cover;
  }
  div.contact {
    display:flex;
    flex-wrap: wrap;
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
  div.works.print div.social,div.works.print div.web {
    max-width: 500px;
  }
  div.social a,div.web a {
    padding:2px 5px;
    overflow-wrap: anywhere;
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
  }
  div.resume {   
    text-align: justify;
    margin: 10px 0;
    padding:0 5px;
    max-width:650px;
  }
  div.resume.guest {
    max-width:95%;
  }
  hr {
    border-color: var(--grey);
    border-width: 1px;
    width:90%;
  }
  div.works {
    display:flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap:20px;
    padding:15px;
  }
  div.works.print.guest {
    align-items:flex-end;
  }
  div.works.print.no-guest {
    flex-direction: column;
    align-items: center;
    gap:5px;
  }
  div.work {
    max-width: 300px;
  }
  div.works.print div.work {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 600px;
  }
  div.works.print div.work img {
    padding-bottom: 10px;;
  }
  div.works div.details {
    display:flex;
    flex-wrap: wrap;
    justify-content: left;
  } 
  div.works.print div.details {
    flex-wrap: nowrap;
    justify-content: center;
    width:100%;
  }
  span.title {
    font-weight: bolder;
    max-width: 250px;   
    white-space: nowrap; 
    overflow: hidden;        
    text-overflow: ellipsis; 
  }
  div.works.print p {
    padding:0 5px;
  }
  div.work p.title {
    justify-content: left;
    font-weight: bolder;
    width:100%;
  }
  p.title,p.technique-media, p.dim, p.price {
    justify-content: left;
    padding-top:5px;
  }
  p.price {
    width:100%;
  }
  div.works.print p.title, div.works.print p.technique-media, div.works.print p.dim, div.works.print p.price {
    justify-content: center;
    width:100%;
  }
  @media screen and (min-width: 450px){
    h4.avatar {  
      gap:20px;
    } 
  } 
  @media screen and (min-width: 900px){
    hr {  
      width:80%;
    } 
  } 
</style>