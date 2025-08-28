import { createRouter, createWebHistory } from 'vue-router'
import cookies from 'js-cookie'
import _ from 'lodash'
import { decodeJWT } from '@/services/httpUsers.js'
import content from '../common/page/master-content.json'
import Home from '../home/Home.vue'
import Dashboard from '../dashboard/Dashboard.vue'
import Master from '../common/page/Master.vue'

function getUserRole() {
  if (!cookies.get('user')) return -1
  const { idRole, idStatus } = decodeJWT(cookies.get('user'))
  if (idStatus === 2) return parseInt(idRole)
  return -1
}
const routes = content.map((item) => {
  return {
    path: `${item.entity.url}`,
    name: item.entity.name,
    component: Master,
    props: {
      entity: item.entity,
      fieldsets: item.fieldsets,
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
        return getUserRole() >= 1 ? { name: 'member home' } : { name: 'public home' }
      },
    },
    { path: '/public/home', name: 'public home', component: Home, meta: { roles: [-1] } }, //no specific role requirement, nor authentication
    {
      path: '/member/home',
      name: 'member home',
      component: Dashboard,
      meta: { roles: [1, 5, 6, 7] },
    },
    ...routes, //member pages
    {
      path: '/public/resetpassword',
      name: 'public resetpassword',
      component: () => import('../login/FormRecover.vue'), //lazy loading
      props: (route) => ({
        id: route.query.id ?? null,
        random: route.query.random ?? null,
      }),
      meta: { roles: [-1] }, //no specific role requirement, nor authentication
    },
  ],
})
router.beforeEach((to) => {
  const role = getUserRole()
  // Public routes → always allow (even if authenticated)
  if (to.meta.roles.includes(-1)) return true //all public pages have meta.roles=[-1] >>> return the page regardless of authentication
  // Protected routes → allow only if authenticated with a matching role
  if (role !== -1 && to.meta.roles.includes(role)) return true
  // Otherwise → send to public home
  if (to.name !== 'public home') return { name: 'public home', query: { redirect: to.fullPath } }
})
export default router
