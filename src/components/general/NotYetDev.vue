<script setup>

  defineProps({
    icon:{type:Boolean}
    })

</script>

<template>
  <div class='not-yet'>
    <a v-if="icon" href="/public/home">
      <q-icon  
        name="home"
        size="5.5rem"
        color='primary'
      >
      </q-icon>
    </a>
    {{ $t('comps.notYet.text') }}
  </div>  

</template>

<style scoped>
  div.not-yet {
    display:flex;
    justify-content: center;
    align-items:center;
    font-family: 'Berlin Sans FB', Arial;
    font-size:2.5rem;
    opacity:0.7;
    height:80%;
  }
  .q-icon {
    opacity:1;
    padding:0 20px 10px;
  }
  @media screen and (min-width: 1200px) {   
    div.not-yet {      
      font-size:5rem;
    }
  } 

</style>