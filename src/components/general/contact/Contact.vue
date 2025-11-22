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
        <p class="house">Place du 11 Novembre-1918 - 31330 Merville</p>
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
    color:#0042A4;    
    text-align: center;
    text-wrap: nowrap;
    font-size: 4rem;
    font-weight: 600;
    background-color: var(--grey-light);
    margin:0;
    padding:10px 0;
  }
  div.contact {
    padding-top: 40px;
    border-top: 1px solid #0042A4;
  }
  p {    
    line-height: 2.2rem;
    margin-bottom:10px;
  }
  address {
    padding:10px 0;
  }
  p.house::before { 
    content: "\1F3E0 ";
    font-style: normal; 
    font-size: 1.8rem;
    padding-right: 10px;
  }
  p.mail::before { 
    content: "\2709 ";
    font-style: normal; 
    font-size: 2.5rem;
    padding-right: 10px;
  }
  p.phone::before {
    content: "\2706 ";
    font-style: normal; 
    font-size: 2.5rem;
    padding-right: 10px;
  }
  img {
    width:180px;
    margin-top:20px;
  }

</style>