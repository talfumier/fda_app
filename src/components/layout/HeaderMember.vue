<script setup>
  import { ref } from 'vue';
  import Tooltip from '../common/Tooltip.vue';
  import FormLogin from '../login/FormLogin.vue';

  const {loggedIn}=defineProps({
    loggedIn:Boolean
  })
  const openLogin=ref(false)
</script>

<template>
  <q-btn 
    class="btn bg-grey-3" 
    :class="loggedIn ? 'hidden' : 'visible'"
    rounded standout
    icon="login" 
    no-wrap
    :label="$t('comps.header.member-btn.text')"
    @click="openLogin=true">
      <Tooltip :tt_text="$t('comps.header.member-btn.tip')" :small="false"></Tooltip>
  </q-btn>
  <FormLogin v-if="openLogin" @closeForm="openLogin=false"></FormLogin>
  <div class="icons" :class="loggedIn ? 'visible' : 'hidden'">
    <q-icon name="settings">
      <Tooltip :tt_text="$t('comps.header.settings-ico.tip')" :small="false"></Tooltip>
    </q-icon>  
    <q-icon name="power_settings_new">    
      <Tooltip :tt_text="$t('comps.header.power-ico.tip')" :small="false"></Tooltip>
    </q-icon>
  </div>
</template>

<style scoped>
  .btn {
    color:var(--white);
    font-size: 1.5rem;
    color: blue;
    font-weight: bolder;
    text-transform: capitalize;
    padding:0 15px;
  }
  .icons {
    display:flex;
    gap:20px;
    color:var(--orange);
    font-size:3.5rem;
    cursor: pointer;
  }
  .visible {
    visibility: visible;
  }
  .hidden {
    visibility: hidden;
  }
</style>