
<script setup>
import Tooltip from '../common/Tooltip.vue';
const {loggedIn}=defineProps({
  loggedIn:Boolean
})
</script>

<template>
  <q-btn 
  class="btn bg-grey-3" 
  :class="loggedIn ? 'hidden' : 'visible'"
  rounded standout
  icon="login" 
  no-wrap
  :label="$t('comps.header.member-btn.text')">
    <Tooltip :tt_text="$t('comps.header.member-btn.tip')"></Tooltip>
  </q-btn>
<div class="icons" :class="loggedIn ? 'visible' : 'hidden'">
  <q-icon name="settings">
    <Tooltip :tt_text="$t('comps.header.settings-ico.tip')"></Tooltip>
  </q-icon>  
  <q-icon name="power_settings_new">    
    <Tooltip :tt_text="$t('comps.header.power-ico.tip')"></Tooltip>
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