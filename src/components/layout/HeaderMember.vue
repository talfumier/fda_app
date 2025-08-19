<script setup>
  import { ref,defineEmits} from 'vue';
  import { useRoute } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  import cookies from 'js-cookie'
  import { decodeJWT } from '@/services/httpUsers.js';
  import Tooltip from '../common/Tooltip.vue';
  import FormLogin from '../login/FormLogin.vue';
  import { useQuasar } from 'quasar'
  import { confirm } from '../common/toast_dialog/dialog.js';

  const route = useRoute()
  
  const {loggedIn}=defineProps({
    loggedIn: { type: Boolean, default: false }
  })
  
  const {t}=useI18n()
  const $q=useQuasar()
  const openLogin=ref(false)
  const email=ref(cookies.get('user')?decodeJWT(cookies.get('user')).email:null)
  
  const showPopup = ref(false)

  const emit=defineEmits(['logOut','logIn']) 

  function onLogIn(val){
    email.value=val
    emit('logIn')
  }
  async function handleLogOut(){    
    if (!(await confirm($q,t('comps.header.power-ico.dialog'),'ok'))) return
    cookies.remove('user')
    emit('logOut')
  }

  let closeTimer = null
  function openMenu () {
    clearTimeout(closeTimer)
    showPopup.value = true
  }
  function scheduleClose () {
    clearTimeout(closeTimer)
    // small delay so the cursor can travel into the menu without closing it
    closeTimer = setTimeout(() => (showPopup.value = false), 120)
  }
  function cancelClose () {
    clearTimeout(closeTimer)
  }
  function forceClose () {
    showPopup.value = false
  }
</script>

<template>
  <q-btn 
    :class="['btn', 'bg-grey-3', !loggedIn?'visible':'hidden']" 
    rounded standout
    icon="login" 
    no-wrap
    :label="$t('comps.header.member-btn.text')"
    @click="openLogin=true"
    tabindex="-1"
    >
      <Tooltip :tt_text="$t('comps.header.member-btn.tip')" :small="false"></Tooltip>
  </q-btn>
  <Transition v-if="openLogin" name="fade">
    <FormLogin  @close-form="openLogin=false" @log-in="onLogIn"></FormLogin>
  </Transition>
  <div :class="['icons',loggedIn?'visible':'hidden']" 
      @mouseenter="openMenu"
      @mouseleave="scheduleClose"
      @click="openMenu"
    >     
    <q-icon 
      name="account_circle"
      role="button"
      tabindex="-1"
      class="cursor-pointer"
      >
      <q-menu
        v-model="showPopup"
        no-parent-event   
        transition-show="fade"
        transition-hide="fade"
        :offset="[0, 10]" 
      >
        <div @mouseenter="cancelClose" @mouseleave="forceClose">
        <q-list dense >
          <q-item 
            clickable 
            v-close-popup
            class="hover-bg-grey-3 hover-text-primary">
            <div class='btn no-cap'>
              <q-icon name="account_circle" size="2.5rem" />
              {{email}}
            </div>
          </q-item>
          <q-separator />     
          <q-item 
            clickable 
            v-close-popup 
            class="hover-bg-grey-3 hover-text-primary "
            @click="">
            <div class='text-bolder color-std'>
              <q-icon name="settings" size="2.5rem" />
              {{t('comps.header.settings-ico.tip')}}
            </div>            
          </q-item>   
          <q-separator />    
          <q-item 
            clickable 
            v-close-popup 
            class="hover-bg-grey-3 hover-text-primary "
            @click="handleLogOut">
            <div class='text-bolder log-out'>
              <q-icon name="power_settings_new" size="2.5rem" />
              {{t('comps.header.power-ico.tip')}}
            </div>            
          </q-item>
        </q-list>
      </div>
      </q-menu>
    </q-icon>  
  </div>
</template>

<style scoped>
  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.6s ease;
  }
  .fade-enter-from, .fade-leave-to {
    opacity: 0;
  }
  .btn {
    color:var(--white);
    font-size: 1.5rem;
    color: blue;
    font-weight: bolder;
    text-transform: capitalize;
    padding:0 15px;
  }
  .no-cap {
    text-transform:lowercase;
  }
  .icons {
    display:flex;
    color:var(--orange);
    font-size:4rem;
    z-index: 5000;
    cursor: pointer;
  }
  .visible {
    visibility: visible;
  }
  .hidden {
    visibility: hidden;
  }
  .q-item div {
    display:flex;
    justify-content: left;
    padding:5px;
    gap:5px;
  }
  .text-bolder {
    font-weight: bolder;
  }
  .log-out {
    color:var(--red-opaque9);
  }
</style>