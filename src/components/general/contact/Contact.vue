<script setup>
  import { useI18n } from 'vue-i18n'

  const {locale}=useI18n()
  
</script>

<template>
  <div class="contact-container">
    <h1>Contact</h1>
    <div class="contact">
      <p v-if="locale==='en'">
        The <strong>Festival des Arts de Merville</strong> is organized by the
        <strong>Municipality of Merville</strong>.
      </p>
      <p v-if="locale==='fr'">
        Le <strong>Festival des Arts de Merville</strong> est organisé par la
        <strong>Mairie de Merville</strong>.
      </p>
      <address>
        <p class="house">Place du 11 Novembre 1918</p>
        <p class="city">31330 Merville</p>
        <p class="country">France</p>
        <p class="mail">
          <a href="mailto:festivaldesarts@merville31.fr">festivaldesarts@merville31.fr</a>
        </p>
        <p class="phone">0562134116</p>
      </address>
    </div>
    <img src='../../../assets/images/logo-mairie-red.png' alt='Mairie de Merville' />
  </div>
</template>

<style scoped>
  div.contact-container {
    display:grid;
    grid-template-columns: 1fr;
    grid-template-rows: repeat(3,auto);
    place-items: center;
    font-size: 2rem;
    opacity: 0.8;
    font-weight: 500;
  }
  
  h1 { 
    font-family: 'Montserrat', sans-serif; 
    font-style: italic;
    font-weight: 500;
    color:var(--blue);    
    text-align: center;
    text-wrap: nowrap;
    font-size: 2.2rem;
    font-weight: 600;
    line-height: normal;
    background-color: var(--grey-light);
    margin:0;
    padding:10px 0;
  }
  div.contact {
    padding: 40px 15px 0;
    border-top: 1px solid var(--blue);
  }
  p {    
    line-height: 2rem;
    margin-bottom:10px;
  }
  address {
    padding:10px 0;
  }
  p.house::before { 
    content: "\f015 ";
    font-family: "Font Awesome 6 Free";
    font-style: normal; 
    font-size: 2rem;
    font-weight: 900;   /*free plan solid icons require font-weight:900, regular icons require font-weight:400*/
    padding-right: 10px;
    opacity:0.8;
  }
  p.city, p.country {
    padding-left: 30px;
  }
  p.mail::before { 
    content: "\f0e0 ";
    font-family: "Font Awesome 6 Free";
    font-style: normal; 
    font-size: 2rem;
    font-weight: 900;
    padding-right: 10px;
    opacity:0.8;
  }
  p.phone::before {
    content: "\f095";
    font-family: "Font Awesome 6 Free";
    font-style: normal; 
    font-size: 2rem;
    font-weight: 900;
    padding-right: 10px;
    opacity:0.8;
  }
  img {
    width:180px;
    margin-top:20px;
  }
  @media screen and (min-width: 1200px) {   
    .html {
      font-size: 2rem;
    } 
    h1 {  
      font-size: 4rem;
    }
    p {
      font-size: 2.2rem;
    }
    p.house::before,p.mail::before,p.phone::before { 
      font-size: 2.2rem;
    }
    .html :deep(:is(.p2,.a2)){
      padding-left: 30px;
    }
    .html :deep(ul) {
      margin:0 25px 10px;
    }
  } 
</style>