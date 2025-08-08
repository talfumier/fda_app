
<script setup>
import { useI18n } from 'vue-i18n'
import Tooltip from '../common/Tooltip.vue';
const {loggedIn}=defineProps({
  loggedIn:Boolean
})
</script>

<template>
  <q-btn elevated rounded class="btn" :class="loggedIn ? 'hidden' : 'visible'" icon="login" :label="$t('comps.header.member')">
    <Tooltip tt_text="Connexion à l'espace membre"></Tooltip>
  </q-btn>
<div class="icons" :class="loggedIn ? 'visible' : 'hidden'">
  <q-icon name="settings">
    <Tooltip tt_text="Paramêtres du compte"></Tooltip>
  </q-icon>  
  <q-icon name="power_settings_new">    
    <Tooltip tt_text="Déconnexion"></Tooltip>
  </q-icon>

</div>
</template>

<style scoped>
.btn {
  background-color: var(--orange);
  color:var(--white);
  font-size: 2rem;
  text-transform: capitalize;
  padding:5px 15px;
}
.icons {
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