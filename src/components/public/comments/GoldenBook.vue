<script setup>
  import { ref,onMounted, onUnmounted  } from 'vue'
  import { fetch } from '../functions'
  import _ from 'lodash'
  import {
    newController,
    doneController,
    cancelAllInFlight,
  } from '@/utilityFunctions.js'   
  import FormComment from './FormComment.vue'

  const inFlight = new Set()

  const globalRating=ref({})
  const expand=ref({})
  
  const state = ref([])
  onMounted(async () => {
    const ctrl = newController(inFlight)
    try {
      state.value = await fetch('public_expo_comment', ctrl.signal)
      const comments={}
      state.value[0].forEach((expo) => {
        const data=_.filter(state.value[1],(item) => {
          return item.idExpo===expo.idExpo && item.idStatus===29  //published comments
        })
        comments[expo.idExpo]={data,n:data.length}
        if(comments[expo.idExpo].n===0) globalRating.value[expo.idExpo]=0
        else {
          globalRating.value[expo.idExpo]=(comments[expo.idExpo].data).reduce((acc,current) => acc+current.rating,0)/comments[expo.idExpo].n
        }
        if(expand.value[expo.idExpo]===undefined) expand.value[expo.idExpo]=false
      })
      state.value[1]=comments
    } catch (error) {
      console.error('onmounted failed in GoldenBook.vue', error)
      return
    } finally {
      doneController(ctrl, inFlight)
    }
  })
  onUnmounted(() => {    
    cancelAllInFlight(inFlight)   // clean-up code after component has unmounted
  })
  
  function getColor(name) {
    const colors = ['#e57373', '#64b5f6', '#81c784', '#ffd54f', '#ba68c8']
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

</script>

<template>
  <main v-if="state.length" class="wrapper">
    <section v-for="(expo,idx) in state[0]" class="expo">
      <div class="header" >
        <q-btn 
          class="year" push
        >
          <div>{{expo.endDate.slice(0,4) }}</div>
        </q-btn>
        <q-rating
          v-model="globalRating[expo.idExpo]"
          max="5"
          size="32px"
          color="green-10"
          disable
        />
        <q-btn
          class="new"
          color="primary"
          rounded push
          no-wrap
          :label="$t('comps.public_site.golden_book.new_btn')"
          @click="expand[expo.idExpo]=!expand[expo.idExpo]"        
        >
          <q-icon
            name="keyboard_arrow_down"
            size="3rem"
            :style="`transform: rotate(${expand[expo.idExpo]?'-180deg' : '0deg'});transition: 0.6s ease;`"
          >
          </q-icon>
        </q-btn>
      </div>  
      <FormComment v-if="idx===0 && expand[expo.idExpo]"
        :idExpo="expo.idExpo"
        @close-form="() => {
          expand[expo.idExpo]=false
        }"
      >
      </FormComment>
      <div class="published-comments">
        <div v-if="state[1][expo.idExpo].n===0" class="no-comment">
          <span>{{ $t('comps.public_site.golden_book.no_comment') }}</span>
          <span>😊</span>
        </div>
        <div v-for="item in state[1][expo.idExpo].data" 
          class="single-comment"
        >
          <q-avatar :style="{ backgroundColor: getColor(`${item.lastName}${item.firstName}`) }" text-color="white">
            {{ `${_.capitalize(item.firstName.slice(0,1))}${_.capitalize(item.lastName.slice(0,1))}` }}
          </q-avatar>
          <div class="details">
            <p class="date">{{$formatDateTime(item.createdAt)}}</p>
            <q-rating
              v-model="item.rating"
              max="5"
              size="20px"
              color="green-10"
              disable
            />
          </div>
          <div class="text">
            <p>{{ item.text }}</p>            
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped> 
  main.wrapper {
    padding-bottom: 30px;
  }
  div.header {
    position:sticky;
    top:0;
    display:flex;
    justify-content: space-between;
    align-items: center;
    width:80vw;
    max-width:600px;
    margin:0 auto;
    z-index: 100;
    background-color: var(--grey-light);
  }
  div.header .q-rating {
    display:none;
  }
  .q-btn.year {
    background-color:var(--orange);
    width:120px;
    margin:20px 0;
    font-weight: bolder;
  }
  .q-btn.new {
    width:170px;
  }
  @keyframes pulse {
    0%   { box-shadow: 0 0 0 0 rgba(0,0,0,.0) }
    40%  { box-shadow: 0 0 0 8px rgba(25,118,210,.25)  } /* adjust color */
    100% { box-shadow: 0 0 0 0 rgba(0,0,0,.0) }
  }
  .pulse { animation: pulse 1.2s ease-out infinite }
  form {
    z-index:-100;
  }  
  div.no-comment {   
    display:flex;
    flex-direction: column;
    align-items: center;
    font-family: "Roboto", sans-serif;
    font-size: 2.5rem;
    font-weight: 400;
    margin:0 auto;
  }
  div.published-comments {
    display: flex;
    flex-direction: column;
    justify-content: left;
    width:80vw;
    max-width:600px;
    margin:0 auto;
  }
  div.single-comment {
    display:flex;
    flex-wrap: wrap;
    justify-content: left;
    padding:10px 20px;
    margin-top:5px;
    border:2px solid var(--green);
    border-radius: 5px;
    width:100%;
  }
  div.details {
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin:0 10px;
  }
  div.details p {
    margin:2px 0;
    line-height: 15px;
    text-align: center;
  }
  p.name {
    color:blue;
    font-size: 1.6rem;
  }
  p.date {
    font-size: 1.3rem;
  }
  div.text {
    margin: 10px 5px 0;

  }
  div.text p { 
    font-size: 1.8rem;
    max-width: 100%;
    word-break: break-word;
    margin:0;
  }
  @media screen and (min-width: 580px){
    div.header .q-rating {
      display:flex;
    }}

</style>