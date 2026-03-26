import { createRouter, createWebHistory } from 'vue-router'
import { i18n } from '@/main.js'
import cookies from 'js-cookie'
import _ from 'lodash'
import { decodeJWT } from '@/services/httpUsers.js'
import content from '../common/page/master-content.json'
import Home from '../public/Home.vue'
import Dashboard from '../dashboard/Dashboard.vue'
import Master from '../common/page/Master.vue'
import NotFound from '../notFound/NotFound.vue'

function getUserRole() {
  let token = null
  if (cookies.get('user')) token = cookies.get('user')
  if (window.__AUTH__) token = window.__AUTH__ //chromium headless for .pdf generation > refer to API download.js
  if (!token) return -1
  const { idRole, idStatus } = decodeJWT(token)
  if (idStatus === 2) return parseInt(idRole)
  return -1
}
function withLocale(path) {
  return `/:locale(fr|en)${path}` //dynamic route parameter with constraint can be either fr or en
}
const SUPPORTED_LOCALES = ['fr', 'en']
const DEFAULT_LOCALE = 'fr'

let fldsets = null
const routes = content.map((item) => {
  fldsets = []
  item.fieldsets.map((fieldset) => {
    if (fieldset.sameAs_idx !== undefined) {
      content[fieldset.sameAs_idx].fieldsets.map((item) => {
        fldsets.push(item)
      })
    } else fldsets.push(fieldset)
  })
  return {
    path: `${item.entity.url}`,
    name: item.entity.name,
    component: Master,
    props: {
      entity: item.entity,
      fieldsets: fldsets,
    },
    meta: { roles: item.entity.roles }, //user must be authenticated and hold the required role to access the page
  }
})
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), //use HTML5 history mode
  routes: [
    {
      path: '/',
      name: 'root',
      redirect: () => {
        return getUserRole() >= 1
          ? { name: 'member home' }
          : { name: 'public home', params: { locale: DEFAULT_LOCALE } }
      },
    },
    {
      path: withLocale('/home'),
      name: 'public home',
      component: Home,
      meta: { roles: [-1] }, //no specific role requirement, nor authentication
    },
    {
      path: '/member/preview/home_print',
      name: 'member preview home_print',
      component: Home,
      meta: { roles: [5, 6, 7] },
    },
    {
      path: '/member/preview/past_events_print',
      name: 'member preview past_events_print',
      component: () => import('../public/PastEvents.vue'), //lazy loading
      meta: { roles: [5, 6, 7] },
    },
    {
      path: withLocale('/catalogue'),
      name: 'public catalogue',
      component: () => import('../public/catalogue/Catalogue.vue'), //lazy loading
      meta: { roles: [-1] },
    },
    {
      path: withLocale('/catalogue/:idUser'),
      name: 'public catalogue idUser',
      component: () => import('../public/catalogue/Catalogue.vue'), //lazy loading
      props: (route) => ({
        idUser: route.params.idUser,
      }),
      meta: { roles: [-1] },
    },
    {
      path: '/member/catalogue_print', //Route called by Chromium headless browser from API back end for printing/exporting pdf file
      name: 'member catalogue_print', //that reflects the content of catalogue_print page
      component: () => import('../public/catalogue/Catalogue.vue'), //lazy loading
      props: () => ({
        print: true,
      }),
      meta: { roles: [5, 6, 7] },
    },
    {
      path: withLocale('/jury_awards'),
      name: 'public jury_awards',
      component: () => import('../public/JuryAwards.vue'), //lazy loading
      meta: { roles: [-1] },
    },
    {
      path: withLocale('/past_events'),
      name: 'public past_events',
      component: () => import('../public/PastEvents.vue'), //lazy loading
      meta: { roles: [-1] },
    },
    {
      path: withLocale('/faq'),
      name: 'public faq',
      component: () => import('../public/faq/Faq.vue'), //lazy loading
      meta: { roles: [-1] },
    },
    {
      path: '/member/faq',
      name: 'member faq',
      component: () => import('../public/faq/Faq.vue'), //lazy loading
      meta: { roles: [1, 3, 5, 6, 7] },
    },
    {
      path: '/member/export',
      name: 'member export',
      component: () => import('../export/DataExport.vue'), //lazy loading
      meta: { roles: [5, 6, 7] },
    },
    {
      path: '/member/home',
      name: 'member home',
      component: Dashboard,
      meta: { roles: [1, 3, 5, 6, 7] },
    },
    ...routes, //member pages
    {
      path: withLocale('/resetpassword'),
      name: 'public resetpassword',
      component: () => import('../login/FormRecover.vue'), //lazy loading
      meta: { roles: [-1] }, //no specific role requirement, nor authentication
    },
    {
      path: withLocale('/privacy'),
      name: 'public privacy',
      component: () => import('../general/LegalPrivacy.vue'), //lazy loading
      props: () => ({
        type: 'privacy',
      }),
      meta: { roles: [-1] }, //no specific role requirement, nor authentication
    },
    {
      path: withLocale('/legal'),
      name: 'public legal',
      component: () => import('../general/LegalPrivacy.vue'), //lazy loading
      props: () => ({
        type: 'legal',
      }),
      meta: { roles: [-1] }, //no specific role requirement, nor authentication
    },
    {
      path: withLocale('/contact'),
      name: 'public contact',
      component: () => import('../general/contact/Contact.vue'), //lazy loading
      meta: { roles: [-1] }, //no specific role requirement, nor authentication
    },
    {
      path: '/:locale(fr|en)/:pathMatch(.*)*', //localized not found
      name: 'NotFoundLocalized',
      component: NotFound,
      meta: { roles: [-1] },
    },
    {
      path: '/:pathMatch(.*)*', //global not found
      name: 'NotFound',
      component: NotFound,
      meta: { roles: [-1] }, //no specific role requirement, nor authentication
    },
  ],
})
router.beforeEach((to) => {
  const role = getUserRole()
  if (to.params.locale) {
    const locale = String(to.params.locale)
    if (!SUPPORTED_LOCALES.includes(locale))
      return { name: 'public home', params: { locale: DEFAULT_LOCALE } }
    document.documentElement.setAttribute('lang', locale)
    i18n.global.locale.value = locale
  }
  // Public routes → always allow (even if authenticated)
  if (to.meta.roles.includes(-1)) return true //all public pages have meta.roles=[-1] >>> return the page regardless of authentication
  // Protected routes → allow only if authenticated with a matching role
  if (role !== -1 && to.meta.roles.includes(role)) return true
  // Otherwise → send to public home
  if (to.name !== 'public home')
    return {
      name: 'public home',
      params: { locale: DEFAULT_LOCALE },
      query: { redirect: to.fullPath },
    }
})
export default router
