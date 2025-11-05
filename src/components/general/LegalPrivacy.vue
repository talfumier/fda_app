<script setup>
  import { ref,watch,onMounted,nextTick } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRoute,useRouter } from 'vue-router'

  const props=defineProps({
    type:{type:String}
  })

  const {locale}=useI18n()
  const router = useRouter()
  const route = useRoute()

  const html=ref(null)

  watch(   
    () => locale.value,              // <-- getter function required for primitive value
    (v) => {loadHtml()},
    { immediate: false }
  )
  async function loadHtml() {
    const module = await import(`./${props.type}/text_${locale.value}.html?raw`)
    html.value = module.default
  }
  onMounted(async() => {
    await loadHtml()    
    await nextTick()
    document.querySelectorAll('.router-link').forEach(link => {
      link.addEventListener('click', event => {
        event.preventDefault()
        router.push(link.getAttribute('href'))
      })
    })
    if(!route.query.register) return
    const element = document.getElementById('cgu')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' }) 
    }
    
  })

</script>

<template>
  <a href="/public/home">
    <q-icon  
      name="home"
      size="4rem"
      color='primary'
    >
    </q-icon>
  </a>  
  <div v-html="html" class='html'> </div>
</template>

<style scoped>
  .html {
    position:relative;
    font-size: 2rem;
    counter-reset: h2counter;
    padding:70px 5% 40px;
    opacity: 0.8;
    font-weight: 500;
  } 
  .q-icon {
    position:absolute;
    top:160px;
    left:5%;
    cursor: pointer;
    z-index: 1000;
  } 
  .html :deep(div.title) {
    position:fixed; 
    top:130px;     
    width:90%;
  }  
  .html :deep(:is(h1, h2, h3)) { 
    font-family: 'Montserrat', sans-serif; 
    font-style: italic;
    font-weight: 600;
    color:#0042A4;
  }
  .html :deep(h1){       
    text-align: center;
    text-wrap: nowrap;
    font-size: 4rem;
    background-color: var(--grey-light);
    margin:0;
    padding:10px 0;
  }
  .html :deep(:is(hr)) {
    margin:0;
    border-top:1px solid #0042A4;
    background-color: var(--grey-light);
  }
  .html :deep(h2)::before {
    counter-increment: h2counter;
    content: counter(h2counter) ". ";
  }
  .html :deep(h2){   
    font-size: 3rem;
    counter-reset: h3counter;
    margin: 20px 0 10px 0 ;
  }  
  .html :deep(h3)::before {
    counter-increment: h3counter;
    content: counter(h2counter) "." counter(h3counter) " ";
    margin-left: 0.5em;
  }
  .html :deep(h3){   
    font-size: 2.5rem;    
    margin: 20px 0 10px 0 ;
  }
  .html :deep(p) {
    text-align: justify;
    line-height: 2.2rem;
    margin-bottom:10px;
  }
  .html :deep(:is(.p2,.a2)){
    padding-left: 30px;
  }
  .html :deep(:is(.p3,.a3)) {
    padding-left: 50px;
  }
  .html :deep(p.house)::before { 
    content: "\1F3E0 ";
    font-style: normal; 
    font-size: 1.8rem;
    padding-right: 10px;
  }
  .html :deep(p.mail)::before { 
    content: "\2709 ";
    font-style: normal; 
    font-size: 2.5rem;
    padding-right: 10px;
  }
  .html :deep(p.phone)::before {
    content: "\2706 ";
    font-style: normal; 
    font-size: 2.5rem;
    padding-right: 10px;
  }
  .html :deep(ul) {
    margin:0 25px 10px;
  }
  @media screen and (min-width: 750px) {   
    .q-icon {
      left:10%;
    }    
    .html {
      padding:90px 10% 40px;
    }  
    .html :deep(div.title) {
      width:80%;
    }  
  } 

</style>