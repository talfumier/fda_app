<script setup>
  import {ref} from 'vue'  
  import { useI18n } from 'vue-i18n'
  import { truncate } from '@/utilityFunctions.js'

  const props=defineProps({
    data:{type:Array}
  })
  
  const {locale}=useI18n() 
  const slide=ref(0)
  const autoplay=ref(false)

</script>

<template>
  <div class="q-pa-md carousel-wrapper">
    <q-carousel
      class="full-width full-height"
      swipeable
      animated
      v-model="slide"
      :autoplay="autoplay"
      ref="carousel"
      infinite
    >
      <q-carousel-slide
        v-for="(file, idx) in data"
        :key="idx"
        :name="idx"
        class="column no-wrap"
      >
        <div v-if="file[`title_${locale}`]" >
          <div class="title">
            {{ truncate(file[`title_${locale}`],50 ) }}
          </div>
          <!-- <div v-if="file[`desc_${locale}`]" >
            {{ truncate(file[`desc_${locale}`],100)}}
          </div> -->
        </div>
        <q-img
          :src="file.url"
          class="slide-image"
          :ratio="4/3"
        />
      </q-carousel-slide>
      <template v-slot:control>
        <q-carousel-control
          position="bottom-left"
          :offset="[18, 18]"
          class="text-white rounded-borders"
          style="background: rgba(0, 0, 0, .3); padding: 4px 8px;"
        >
          <q-toggle dense dark color="orange" v-model="autoplay" 
                :true-value="3000" :false-value="false" label="Auto Play" />
        </q-carousel-control>
        <q-carousel-control
          position="bottom-right"
          :offset="[18, 18]"
          class="q-gutter-xs"
        >
          <q-btn
            push round dense color="orange" text-color="black" icon="arrow_left"
            @click="$refs.carousel.previous()"
          />
          <q-btn
            push round dense color="orange" text-color="black" icon="arrow_right"
            @click="$refs.carousel.next()"
          />
        </q-carousel-control>
      </template>
    </q-carousel>
  </div>
</template>

<style scoped>
  .carousel-wrapper {
    padding: 0 5px;
    border: 1px solid grey;
    width: 100%;
    box-sizing: border-box;
  }
  main.photos .carousel-wrapper {    /* guest.vue */
      border-width:1px 0 0 0 ;
    }
  main.photos .q-carousel__slide {  /* guest.vue */
    padding:5px ;
  }
  div.title {
    font-size:1.7rem;
    font-weight: bolder;
    opacity:.7;
  }
  .div.description {
    margin-top: 4px;
    opacity: 0.8;
  }
  .slide-image {
    flex: 1 1 auto;
  }  
  @media screen and (min-width: 1000px) { 
    main.photos .carousel-wrapper {    /* guest.vue */
      border-width:0 0 0 1px ;
    }

  }
</style>