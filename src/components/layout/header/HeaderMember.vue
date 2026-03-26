<script setup>
  import { inject,ref} from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import Tooltip from '@/components/common/Tooltip.vue'
  import FormLogin from '../../login/FormLogin.vue'
  import { useQuasar } from 'quasar'
  import { confirm } from '../../common/dialog/dialog.js'
  
  const {token,decoded, remove} = inject('userCookie')

  const {t,locale}=useI18n()
  const router=useRouter()
  const route=useRoute()
  const $q=useQuasar()

  const emit=defineEmits(['lang'])

  const openLogin=ref(false)
  const email=ref(decoded.value?decoded.value.email:null)  //initial value when a cookie is already set (reload, connection to the site)
  
  const showPopup = ref(false)

  function handleLogIn(mail,lang){
    email.value=mail
    emit('lang',lang)
  }
  async function handleLogOut(){    
    if (!(await confirm($q,t('comps.header.power-ico.dialog'),'ok'))) return
    remove('user')
    router.push({ name: 'public home',params: { locale: locale.value }})
  }
  function handleClick(){
    if(route.name.includes('member')) router.push({ name: 'public home',params: { locale: locale.value }})
    else if(route.name.includes('public')) {
      if(!token.value) openLogin.value=true
      else router.push({ name: 'member home' })
    }
  }
  function getTooltipText(){
    if(route.name?.includes('member')) return t('comps.header.public-btn.tip')
    else if(token.value) return t('comps.header.member-btn.tip2')
    return t('comps.header.member-btn.tip1')
  }
  //Dropdown menu opening - closing
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
  function getLabel(w=null){
    if(w && $q.screen.width<w) return ''
    return t(`comps.header.${route.name?.includes('member')?'public-btn':'member-btn'}.text`)
  }

</script>

<template>
  <div class="hamburger-menu">
    <q-btn flat round icon="menu" size="2rem">
      <q-menu>
        <q-list dense :style="`min-width: ${locale==='fr'?'155px':'120px'}`">
          <q-item  
            clickable v-close-popup
            @click="handleClick"
          >
            <q-item-section>{{getLabel()}}</q-item-section>
          </q-item>
          <q-separator />
          <q-item v-if="token" 
            clickable v-close-popup 
            @click="() => {
                router.push({ name: 'member user' })
              }"
          >
            <q-item-section>{{t('comps.header.settings-ico.tip')}}</q-item-section>
          </q-item>
          <q-separator /> 
          <q-item v-if="token" 
            clickable v-close-popup
            @click="handleLogOut"
          >
            <q-item-section>{{t('comps.header.power-ico.tip')}}</q-item-section>
          </q-item>        
        </q-list>
      </q-menu>
    </q-btn>
  </div>
  <q-btn 
    :class="['btn', 'bg-grey-3']" 
    rounded standout
    icon="login" 
    no-wrap
    :label="getLabel(965)"
    @click="handleClick"
    tabindex="-1"
    >
      <Tooltip :tt_text="getTooltipText()" :small="false"></Tooltip>
  </q-btn>
  <Transition v-if="openLogin" name="fade">
    <FormLogin  @close-form="openLogin=false" @log-in="handleLogIn"></FormLogin>
  </Transition>
  <div :key="token" :class="['icons',token?'visible':'hidden']" 
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
              @click="() => {
                router.push({ name: 'member user' })
              }"
              >
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
  div.hamburger-menu {
    display:block;
    color:var(--orange);
  }
  ::v-deep(div.q-item){
    padding:0;
  }
  .btn {
    display:none;
    font-size: 1.5rem;
    color: blue;
    font-weight: bolder;
    text-transform: capitalize;
    padding:0 15px;
    width:100%;
  }
  .no-cap {
    text-transform:lowercase;
  }
  .icons {
    display:none;
    color:var(--orange);
    font-size:4rem;
    z-index: 5000;
    cursor: pointer;
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
  .visible {
    visibility: visible;
  }
  .hidden {
    visibility: hidden;
  }
  @media screen and (min-width: 515px){
    div.hamburger-menu {
      display:none;
    }
    .btn {
      display:block;
    }
    .icons {
      display:flex;
    }
  }
</style>