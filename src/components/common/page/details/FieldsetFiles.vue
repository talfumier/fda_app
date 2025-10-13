<script setup>
  import { ref,onMounted, onUnmounted, inject} from 'vue'
  import FieldsetFile from './FieldsetFile.vue'
  import { getEntitiesBySql } from '@/services/httpEntities.js'
  
  const props = defineProps({
    fileYes:{type:String},
    model:{type:String},
    fields:{type:Array},
    count:{type:Number},
    data:{type:Object}
  })  
  const {token}=inject('userCookie')
  const images=ref(null)
  // IMAGE DATA LOADING
  const ctrl=new AbortController()   // AbortController's object' used in http request operation
  async function fetch() {
    const {data:res}=await getEntitiesBySql(
      'list_images_expo',
      token.value,
      ctrl.signal,
      ':idExpo', 
      props.data.idExpo
    )
    return res.data[0]
  } 
  onMounted(async() => {
    images.value=await fetch()
  })
  onUnmounted(() => {  // clean-up code after component has unmounted    
    ctrl.abort    
  })
</script>

<template>
  <div v-if="images!==null" class="files-container">
    <FieldsetFile v-for="idx in count"
      :key="idx"
      :fileYes="fileYes"
      :model="model"
      :fields="fields"
      :data="images[idx-1]?images[idx-1]:data"
    >
    </FieldsetFile>
  </div>
</template>

<style scoped>
  div.files-container {
    display: flex;
    justify-content:space-between;
    align-items: top;
    gap:20px;
  }

</style>