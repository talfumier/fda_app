<script setup>
  import {ref} from 'vue'
  import MapOsm from './MapOsm.vue'

  const props=defineProps({
    data:{type:Object}
  })
</script>

<template>
  <section class="visit">
    <div class="text">
      <h2>{{ $t('comps.public_site.home.visit.title') }}</h2>
      <address>
        <h3 class="building">{{ data.building }}</h3>
        <q-icon name="fa fa-home" size="2rem"></q-icon>
        <div class="address">
          <p >{{ data.address }}</p>
          <p>{{ `${data.zipCode} ${data.city}` }}</p>
          <p>{{ data.country }}</p>
        </div>
        <q-icon name="fa fa-globe" size="2rem"></q-icon>        
        <p>{{ `Latitude : ${data.gpsLat}° | Longitude : ${data.gpsLong}°` }}</p>
        <h3>{{ $t('comps.public_site.home.visit.info') }}</h3>
        <q-icon name="fa fa-envelope" size="2rem"></q-icon>  
        <a href="mailto:festivaldesarts@merville31.fr">festivaldesarts@merville31.fr</a>
        <q-icon name="fa fa-phone" size="2rem"></q-icon>  
        <p>0562134116</p>
      </address>
    </div>
    <MapOsm 
      :lat="Number(data.gpsLat)"
      :lng="Number(data.gpsLong)"
      :markers="[{
        id:1,
        lat:Number(data.gpsLat),
        lng:Number(data.gpsLong),
        label:data.building
      }]"
    >
    </MapOsm>
  </section>  
</template>

<style scoped>  
  section.visit {
    display:flex;
    flex-wrap: wrap;
    justify-content: center;
    gap:50px;
    font-family: 'Roboto', Arial;
    font-size:1.5rem;  
    padding:10px 0;
    background-color: var(--orange);
  }
  div.text {
    grid-row: 1/span 2;
    grid-column: 1/span 2;
  }
  div.text p {
    text-align: justify;
  }
  h2,h3 {    
    font-family: 'Berlin Sans FB', Arial;
    margin:0;
  }
  h2 {
    font-size: 2.3rem;
    line-height: 1.9rem;
    margin-bottom: 10px;
  }
  div.middle h2 {
    margin-top:10px;
  }
  h3 {
    font-size: 1.8rem;
    line-height: 1.5rem;
    padding-bottom: 5px;
  }
  p {
    white-space: pre-line;
    line-height: 1.9rem;
    margin:0;
  }
  address {
    display:grid;
    grid-template-rows: auto;
    grid-template-columns: 30px auto;
    gap:5px;
    font-style: normal;
  }
  address h3 {
    grid-column: 1/span 2;
    padding:5px 0;
  }
  div.address {
    display:flex;
    flex-direction: column;
  }
  div.visit .q-icon {
    justify-self: center;
    opacity: 0.7;
  }
  
  @media screen and (min-width: 1200px){
    section {
      font-size:1.7rem;  
      line-height: 2rem;
    }
    h2 {
      font-size: 2.5rem;
      padding-top:10px;
    }
    h3 {
      font-size: 2rem;
      line-height: 1.7rem;
    }
  }

</style>