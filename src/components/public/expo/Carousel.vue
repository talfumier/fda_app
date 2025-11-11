<script setup>
  import {ref} from 'vue';

  const props=defineProps({
    data:{type:Array}
  })

  const slide=ref(0)
  const autoplay=ref(false)

</script>

<template>
  <div class="q-pa-md">
    <q-carousel
      swipeable
      animated
      v-model="slide"
      :autoplay="autoplay"
      ref="carousel"
      infinite
    >
      <q-carousel-slide v-for="(file,idx) in data":name="idx" :img-src="file.url" />
      <template v-slot:control>
        <q-carousel-control
          position="top-right"
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
  div.q-pa-md {
    margin:30px 70px;
    padding:5px;
    border:1px solid grey;
  }
</style>