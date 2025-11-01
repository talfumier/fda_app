<script setup>  
  import VuePdfEmbed from 'vue-pdf-embed'

  defineProps({
    file:{type:Object},
    fileYes:{type:Array},
    supported:{type:Object},
    size:{type:String}
  })

</script>

<template>
  <div 
    v-if="file.url && fileYes.includes('image') && supported.image.includes(file.ext)" class="image"
    :class="size"
  >
    <img :src="file.url" :alt="file.name">
  </div>
  <div v-if="file.url && fileYes.includes('msoffice') && supported.msoffice.includes(file.ext)">
    <iframe 
      :src="`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.url)}`"        
    ></iframe>
  </div>
  <div v-if="file.url && fileYes.includes('pdf') && file.ext==='.pdf'">
    <vue-pdf-embed :source="file.url" />
  </div>

</template>

<style scoped>
  img {
    object-fit: cover;
    padding:5px;
    border:1px solid lightgrey;
    margin-left: 0;
  }  
  div.large img {
    height:265px;
  }
  div.medium img {
    height:223px;
  }
  div.small img {
    height:190px;
  }
  div.vue-pdf-embed {
    padding:5px;
    border:1px solid lightgrey;
    margin-left: 0;
    height:270px;
    overflow-y:auto;
  }
  iframe {    
    padding:5px;
    border:1px solid lightgrey;
    margin-left: 0;
    height:270px;
    overflow-y:auto;
  }

</style>