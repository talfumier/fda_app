<script setup>
  import { ref,onMounted,onUnmounted,inject} from 'vue'
  import { useI18n } from 'vue-i18n'
  import { getEntitiesBySql } from '@/services/httpEntities.js'
  import { newController,doneController,cancelAllInFlight } from '@/utilityFunctions.js'
  import Accounts from './elements/Accounts.vue'
  import Oeuvres from './elements/Oeuvres.vue'
  import Pie2BarPie from './elements/registrations/Pie2BarPie.vue'
  import NotYet from '../general/NotYetDev.vue'

  defineProps({
  })
  
  const {token,decoded}=inject('userCookie')
  const {t,locale}=useI18n()
  const inFlight=new Set()

  const state=ref([])
  async function fetch(signal){
    const {data:res}=await getEntitiesBySql(
      'dashboard',
      token.value,
      signal
    )
    if(res.statusCode===200) return res.data
    return []
  }
  onMounted(async () => {  
    const ctrl=newController(inFlight)
    try {
      state.value = await fetch(ctrl.signal)  
    } catch (error) {
      console.error('onmounted failed in Dashboard.vue', error)
      return
    }
    finally {
      doneController(ctrl,inFlight)
    }
  })
  onUnmounted(() => { // clean-up code after component has unmounted  
    cancelAllInFlight(inFlight)
  }) 

</script>

<template>
  <div v-if="state.length>0 && decoded.idRole>=5" class="container">
    <Accounts 
        :data="state[0]"
        :locale="locale"
    >
    </Accounts>
    <Oeuvres 
      :data="state[1]"
      :locale="locale"
      :t="t"
    >
    </Oeuvres>
    <Pie2BarPie
      :data="[state[2],state[3]]"
      :locale="locale"
      :t="t"
    >
    </Pie2BarPie>
  </div>
  <NotYet v-if="decoded.idRole<5" :icon="false"></NotYet>
</template>

<style scoped>
  div.container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
  }

</style>