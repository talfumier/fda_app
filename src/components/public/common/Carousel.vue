<script setup>
  import {ref} from 'vue'  
  import { useI18n } from 'vue-i18n'
  import { truncate } from '@/utilityFunctions.js'

  const props=defineProps({
    locale:{type:String},
    data:{type:Array}
  })
  
  const {locale}=useI18n() 
  const slide=ref(0)
  const autoplay=ref(true)

</script>

<template>
  <div class="carousel-wrapper">
    <q-carousel
      class="full-width full-height"
      swipeable
      animated
      v-model="slide"
      :autoplay="autoplay ? 3000 : false"
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
          <q-toggle dense dark color="orange" v-model="autoplay" label="Auto Play" />
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
    width:calc(100vw - 40px);
    max-width:700px;
  }
  main.photos .carousel-wrapper { 
    border-width:1px 0 0 0 ;
    border-color:var(--blue);
  }
  main.photos .q-carousel__slide { 
    padding:5px ;
  }
  div.title {
    font-size:1.7rem;
    font-weight: bolder;
    opacity:.7;
  }
  .slide-image {
    flex: 1 1 auto;
  }  
  @media screen and (min-width: 1000px) { 
    main.photos .carousel-wrapper { 
      border-width:0 0 0 1px ;
    }

  }
</style>