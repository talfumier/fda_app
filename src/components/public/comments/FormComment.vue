<script setup>
  import {ref,computed,onUnmounted} from 'vue'  
  import { useRoute } from 'vue-router' 
  import DOMPurify from 'dompurify'
  import {
    newController,
    doneController,
    cancelAllInFlight,
    htmlToText
  } from '@/utilityFunctions.js'   
  import { validate } from '@/components/common/fields/validation.js'
  import http from '../../../services/httpService.js'
  import { environment } from '@/config/environment.js'

  const props=defineProps({
    idExpo:{type:Number}
  })

  const inFlight = new Set()
  const route=useRoute() 
  const locale = computed(() => route.params.locale || 'fr')

  const emit=defineEmits(['closeForm'])

  const empty={lastName:'',firstName:'',email:'',rating:0,text:''}
  const comment=ref({...empty})
  const valid=ref({lastName:false,firstName:false,email:false,text:false})

  
  function sanitizeEmail(email) {
    const normalized = email.trim().toLowerCase()
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(normalized) ? normalized : ''
  }
  function sanitizeComment(raw) {
    return {
      lastName: DOMPurify.sanitize(raw.lastName, { ALLOWED_TAGS: [] }),
      firstName: DOMPurify.sanitize(raw.firstName, { ALLOWED_TAGS: [] }),
      email: sanitizeEmail(raw.email),
      rating: raw.rating,
      text: DOMPurify.sanitize(raw.text, {
        ALLOWED_TAGS: ['b', 'i', 'p', 'br'],
        ALLOWED_ATTR: []
      })
    }
  }
  function postComment(data, signal) {  //create comment with idStatus=28 > candidate
    return http.post(`${environment.api_url}/comments`, data, {
      signal,
    })
  }
  async function sendPostRequest() {
    const ctrl = newController(inFlight)
    try {
      const {data:res}=await postComment({...sanitizeComment(comment.value),idExpo:props.idExpo,lang:locale.value},ctrl.signal)
      if(res.statusCode!==200) return
      emit('closeForm')
    } catch (error) {
      
    } finally {
      doneController(ctrl, inFlight)
    }    
  }
  
  onUnmounted(() => {    
    cancelAllInFlight(inFlight)   // clean-up code after component has unmounted
  })

</script>

<template>   
  <form @submit.prevent="sendPostRequest()" @reset.prevent="emit('closeForm')">
    <div class="new-comment">
      <div class="bio">
        <q-input 
          v-model="comment.lastName" 
          :label="`${$t('comps.login.lastName')} *`" 
          dense
          class="lastName"
          :rules="[(val) => {
            const result=validate(val,'text')   
            valid.lastName=result.valid                              
            if(!result.valid) return htmlToText($t(result.msg))     
          }]"
        > 
          <template v-slot:append>
            <q-icon name="close" @click="comment.lastName = ''" class="cursor-pointer" />
          </template>
        </q-input>
        <q-input 
          v-model="comment.firstName" 
          :label="`${$t('comps.login.firstName')} *`" 
          dense
          class="firstName"
          :rules="[(val) => {
            const result=validate(val,'text')
            valid.firstName=result.valid            
            if(!result.valid) return htmlToText($t(result.msg)) 
          }]"
        > 
          <template v-slot:append>
            <q-icon name="close" @click="comment.firstName = ''" class="cursor-pointer" />
          </template>
        </q-input>
        <q-input
          v-model="comment.email"
          type="email"
          :label="$t('comps.public_site.golden_book.email')"
          dense
          class="email"        
          :rules="[
            (val) => {
              const result=validate(val,'email')
              valid.email=result.valid            
              if(!result.valid) return htmlToText($t(result.msg))
            }]"
        > 
          <template v-slot:append>
            <q-icon name="close" @click="comment.email = ''" class="cursor-pointer" />
          </template>
        </q-input>
      </div>
      <q-rating
        v-model="comment.rating"
        max="5"
        size="25px"
        color="positive"
      />
      <q-input 
        v-model="comment.text" 
        type="textarea" 
        filled
        class="text"
        :label="`${$t('comps.public_site.golden_book.comment_lbl')} *`"
        maxlength="200"
        counter
        :rules="[(val) => {
            const result=validate(val,'text')
            valid.text=result.valid            
            if(!result.valid) return htmlToText($t(result.msg))
          }]"
      >
        <template v-slot:append>
          <q-icon name="close" @click="comment.text = ''" class="cursor-pointer" />
        </template>
      </q-input>
      <div class="post-cancel">
        <q-btn 
          type="submit" :label="$t('comps.public_site.golden_book.post')" color="primary" 
          :disable="JSON.stringify(valid).includes(false)"
        />
        <q-btn type="reset" :label="$t('comps.public_site.golden_book.cancel')" flat />
      </div>
    </div>
  </form>
</template>

<style scoped>
  div.new-comment {    
    display:flex;
    flex-direction: column;
    gap:10px;
    width:80vw;
    height: fit-content;
    max-width:600px;
    margin:0 auto;
    border:2px solid var(--green);
    border-radius: 5px;
    padding:10px;
  }
  div.bio {
    display:flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap:10px;
    margin:0 auto;
  }
  .q-input,:deep(.q-field__native) {
    font-size: 1.7rem;
  }
  .text :deep(.q-field__native) {
    height: 90px;
  }
  :deep(.q-field__label){
    font-size: 1.8rem;
  }
  :deep(.q-field__bottom){
    font-size: 1.5rem;
  }
  .q-input.firstName {
    width:240px;
  }
  .q-input.lastName,.q-input.email {
    width:300px;
  }
  div.post-cancel {
    display:flex;
    justify-content: right;
    margin:0;
  }

</style>