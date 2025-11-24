<script setup>
  import { useI18n } from 'vue-i18n'
  import WebSocial from './WebSocial.vue'

  const props=defineProps({
    data:{type:Array}
  })
  
  const {locale}=useI18n() 

</script>

<template>
  <section :key="partner.idPartner" v-for="partner in data">
    <aside>
      <div class="contact-details">
        <ul class="partner">
          <li class='name'>{{partner.name}}</li> 
          <li>
            <address>
              <p class="house">{{partner.address}}&nbsp;-&nbsp;{{`${partner.zipCode} ${partner.city}` }}</p>              
              <p class="phone">{{ partner.phone }}</p>
            </address>
          </li>
        </ul>
      </div>
      <WebSocial
        :links="{web1:partner.web1,web2:partner.web2,social1:partner.social1,social2:partner.social2}"
      >
      </WebSocial>
      <div class="resume">{{partner[`resume_${locale}`] }}
      </div>
    </aside>
      <hr>
    <main class="photo">
      <img class='photo':src="partner.url" :alt="`${partner.name}`">
    </main>
  </section>

</template>

<style scoped>
  section {
    display:flex;
    flex-direction: column; 
    font-size: 1.5rem;
    border:solid 2px var(--blue);
    border-radius: 5px;
    font-family: 'Roboto', sans-serif; 
    max-width: 700px;
    margin:10px;
  }
  aside {
    display:flex;
    flex-direction: column;
    padding-bottom: 10px;
  }
  div.contact-details {
    display:flex;
    flex-direction: column;
    align-items: flex-start;
  }
  p {
    margin:0;
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
  ul {
    display:flex;
    list-style-type: none;
    padding:0 15px 0 10px;
    margin:0;
  }
  ul.partner {    
    flex-direction: column;
    justify-content:flex-start;
  }
  li {
    display:flex;
    flex-direction: column;
    align-items: flex-start;
    line-height: 2.4rem;
  }
  li.name,li.web {
    font-weight: bolder;
    opacity:0.8;
  }
  li.phone::before {
    content: "\2706 ";
    font-style: normal; 
    font-size: 2.5rem;
    padding-right: 10px;
  }
  main.photo {
    flex: 1;             /* take all remaining space */
    display: flex;       /* so we can center/stretch the image */
    align-items: stretch;
    justify-content: center;
  }
  img.photo {
    width: 50%;
    height: 50%;
    object-fit: cover;   /* fill space without distortion */
  }
  hr {
    margin:0;
    padding:0;
    color: var(--blue);
    height:1px;
  }
  div.resume {
    padding:10px 15px;
    text-align: justify;
    height:150px;
    overflow-y: auto;
    width:100%;
  }
  @media screen and (min-width: 1000px) { 
    section {
      flex-direction: row;    
      height:300px;
    }
    aside {
      width: 350px;
      
    border-right: 1px solid var(--blue);
    }
    div.resume {
      height:100%;
    }
    img.photo {
      width: 100%;
      height: 100%;
    }
  } 

</style>