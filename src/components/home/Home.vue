<script setup>
  import { useI18n } from 'vue-i18n'
  import photo1 from '../../assets/images/home/photo1.jpg'
  import photo2 from '../../assets/images/home/photo2.jpg'
  import photo3 from '../../assets/images/home/photo3.jpg'
  import photo4 from '../../assets/images/home/photo4.jpg'

  const {locale}=useI18n()
  const photos = [photo1, photo2, photo3, photo4]
</script>

<template> 
  <section v-if="locale==='fr'" class="fr"> 
    <section class='top' >
      <h2>Bienvenue sur le site du Festival des Arts </h2>
      <div class="main">
        <img src="../../assets/images/home/fda_10.jpg" alt="Festival des arts 10e anniversaire"/>
        <div class="text">
          <p class="first">La 10e édition du Festival des Arts se tiendra du <span>10 au 12 avril 2026 !</span></p>
          <p>Pendant 3 jours, 70 artistes exposeront peintures, sculptures et photographies au complexe culturel l'Arpège de Merville.</p>
          <p class="last">Gratuit et ouvert à toutes et à tous.</p>
        </div> 
      </div>
    </section>
    <section class="middle">
      <h2>Inscription des artistes</h2>
      <div class="text">
        <p>Vous souhaitez exposer vos œuvres au Festival des Arts 2026 de Merville ?</p>
        <p>Inscrivez-vous dès maintenant, en créant votre compte dans l'espace membre en haut et à droite.</p>
        <p >Clôture des inscriptions le <span style='color:red;'>?? février 2026.</span></p>
      </div>
    </section>
    <section class="bottom">
      <img v-for="(src, i) in photos" :key="i" :src="src" :alt="`photo${i+1}`">
    </section>
  </section> 
  <section v-if="locale==='en'" class="en">
    <section class="top">
      <h2>Welcome to the Festival of Arts website</h2>
      <div class="main">
        <img src="../../assets/images/home/fda_10.jpg" alt="Festival of Arts 10th anniversary" />
        <div class="text">
          <p class="first">The 10th edition of the Festival of Arts will take place from<br><span>April 10 to 12, 2026 !</span></p>
          <p>For three days, 70 artists will exhibit paintings, sculptures, and photographs at the Arpège Cultural Center in Merville.</p>
          <p class="last">Free and open to everyone.</p>
        </div>   
      </div>
    </section>

    <section class="middle">
      <h2>Artist Registration</h2>
      <div class="text">
        <p>Would you like to exhibit your work at the 2026 Merville Festival of Arts ?</p>
        <p>Sign up now by creating your account in the member area at the top right.</p>
        <p>Registration closes on <span>?? February 2026.</span></p>
      </div>
    </section>
    <section class="bottom">
      <img v-for="(src, i) in photos" :key="i" :src="src" :alt="`photo${i+1}`">
    </section>
  </section>
</template>

<style scoped>
  section.top, section.middle {
    display:flex;
    flex-direction: column;
    align-items: center;
    font-family: 'Berlin Sans FB', Arial;
    font-size:2.5rem;
  }
  h2 {
    font-size:3.5rem;
    text-align: center;
    margin:25px 0;
    color:#0042A4;
    opacity: 0.8;
  }
  div.main {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  img.map, .bottom img {    
    transition: transform 0.5s ease;
  }
  .main img {
    width:350px;
    height:210px;
    margin-top:10px;
  }
  div.text {
    display: flex;
    flex-direction: column;
  }
  .top div.text {
    justify-content: space-evenly;
    width:90%;
  }
  .middle div.text {
    align-items: center;
    width:100%
  }
  p {
    opacity: 0.7;
    line-height: 3rem;
  }
  .top p {
    text-align:justify ;
    margin:10px 0;
  }
  p.first {
    margin-top:10px;
  }
  p.last {
    margin-bottom:0;
  }
  .middle p {
    text-align: center;
    margin:0 0 15px;
  }
  span {
    color:red;
  }
  section.bottom {
    display:flex;
    flex-wrap: wrap;
    justify-content: center;
    gap:30px;
  }
  .bottom img {
    height:190px;
  }
  @media screen and (min-width: 1020px) { 
    div.main {
      flex-direction: row;
      justify-content: center;
      column-gap: 30px;
    }
     .top div.text {
      width:50%;
    }
    .top p {
      text-align:left;
    }
    p.first {
      margin-top:0;
    }
    .bottom img:hover{
      transform: scale(1.3) translateY(-20px);
      border:5px solid var(--orange);
      z-index: 1000;
    }
  } 
  @media screen and (min-width: 1200px) {   
    h2 {
      font-size:5rem;
    }
    section.top, section.middle {
      font-size:3rem;
    }
    }
</style>
