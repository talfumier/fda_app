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
  <div v-html="html" class='html'> </div>
</template>

<style scoped>
  .html {
    font-size: 2rem;
    counter-reset: h2counter;
    padding:0px 5% 40px;
    opacity: 0.8;
    font-weight: 500;
  } 
  .html :deep(div.title) {
    position:sticky; 
    top:0;
    width:100%;
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
    font-size: 4rem;
    background-color: var(--grey-light);
    margin:0;
    padding:10px 0;
    /* background-color: blueviolet; */
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
    .html {
      padding:0px 10% 40px;
    }  
  } 

</style>