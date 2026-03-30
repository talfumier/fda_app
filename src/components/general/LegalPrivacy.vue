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
    html.value = (module.default).replace('en|fr',locale.value)
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
  <div v-html="html" class='html'> </div>
</template>

<style scoped>
  .html {
    font-size: 1.8rem;
    counter-reset: h2counter;
    padding:0px 5% 40px;
    opacity: 0.8;
  } 
  .html :deep(div.title) {
    position:sticky; 
    top:0;
    width:100%;
    z-index: 10000;
  }  
  .html :deep(:is(h1, h2, h3)) { 
    font-family: 'Montserrat', sans-serif; 
    font-style: italic;
    font-weight: 600;
    color:var(--blue);
  }
  .html :deep(h1){       
    text-align: center;
    text-wrap: nowrap;
    font-size: 2.2rem;
    line-height:normal;
    background-color: var(--grey-light);
    margin:0;
    padding:10px 0;
  }
  .html :deep(:is(hr)) {
    margin:0;
    border-top:1px solid var(--blue);
    background-color: var(--grey-light);padding:0 5%;
  }
  .html :deep(h2)::before {
    counter-increment: h2counter;
    content: counter(h2counter) ". ";
  }
  .html :deep(h2){   
    font-size: 2rem;
    counter-reset: h3counter;
    line-height: normal;
    margin: 5px 0 10px 0 ;
  }  
  .html :deep(h3)::before {
    counter-increment: h3counter;
    content: counter(h2counter) "." counter(h3counter) " ";
  }
  .html :deep(h3){   
    font-size: 2rem;    
    margin: 5px 0 5px 0 ;
  }
  .html :deep(p) {
    text-align: justify;
    line-height: 2rem;
    margin-bottom:10px;
  }
  .html :deep(:is(.p2,.a2)){
    padding-left: 0px;
  }
  .html :deep(p.house)::before { 
    content: "\f015 ";
    font-family: "Font Awesome 6 Free";
    font-style: normal; 
    font-size: 1.5rem;
    font-weight: 900;  /*free plan solid icons require font-weight:900, regular icons require font-weight:400*/
    padding-right: 10px;
    opacity:0.8;
  }
  .html :deep(p.city), .html :deep(p.country) {
    padding-left: 30px;
  }
  .html :deep(p.mail)::before { 
    content: "\f0e0 ";
    font-family: "Font Awesome 6 Free";
    font-style: normal; 
    font-size: 1.5rem;
    font-weight: 900;
    padding-right: 10px;
    opacity:0.8;
  }
  .html :deep(p.phone)::before {
    content: "\f095";
    font-family: "Font Awesome 6 Free";
    font-style: normal; 
    font-size: 1.5rem;
    font-weight: 900;
    padding-right: 10px;
    opacity:0.8;
  }
  .html :deep(ul) {
    margin:0;
  }
  @media screen and (min-width: 750px) {        
    .html {
      padding:0px 10% 40px;
    }  
  } 
  @media screen and (min-width: 1200px) {   
    .html {
      font-size: 2rem;      
      font-weight: 450;
    } 
    .html :deep(h1){  
      font-size: 4rem;
    }
    .html :deep(h2){   
      font-size: 3rem;
    }  
    .html :deep(h3){   
      font-size: 2.5rem;  
    }
    .html :deep(p.house)::before,.html :deep(p.mail)::before,.html :deep(p.phone)::before { 
      font-size: 2rem;
    }
    .html :deep(ul) {
      margin:0 25px 10px 0;
    }
  } 

</style>