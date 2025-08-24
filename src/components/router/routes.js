import { createRouter, createWebHistory } from 'vue-router'
import cookies from 'js-cookie'
import _ from 'lodash'
import { decodeJWT } from '@/services/httpUsers.js'
import content from '../common/page/content.json'
import Home from '../home/Home.vue'
import Dashboard from '../dashboard/Dashboard.vue'
import Master from '../common/page/Master.vue'

function userIsAuthenticated() {
  if (!cookies.get('user')) return [false]
  const { idRole, idStatus } = decodeJWT(cookies.get('user'))
  console.log(idRole, idStatus)
  if (idStatus !== 2) return [false]
  return [true, parseInt(idRole)]
}
const routes = content.map((item) => {
  return {
    path: `/${item.entity.url}`,
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
      redirect: () => (userIsAuthenticated()[0] ? { name: 'dashboard' } : { name: 'home' }),
    },
    { path: '/home', name: 'home', component: Home, meta: { roles: [] } },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
      meta: { roles: [1, 5, 6] },
    },
    ...routes, //protected pages
    {
      path: '/resetpassword',
      name: 'resetpassword',
      component: () => import('../login/FormRecover.vue'), //lazy loading
      props: (route) => ({
        id: route.query.id ?? null,
        random: route.query.random ?? null,
      }),
      meta: { roles: [] }, //no specific role requirement, nor authentication
    },
  ],
})
router.beforeEach((to) => {
  const [isAuthed, role] = userIsAuthenticated()
  // Public routes → always allow (even if authenticated)
  if (to.meta.roles.length === 0) return true //all public pages have meta.roles=[] >>> return the page regardless of authentication
  // Protected routes → allow only if authenticated with a matching role
  if (isAuthed && to.meta.roles.includes(role)) return true
  // Otherwise → send to public home
  return { name: 'home', query: { redirect: to.fullPath } }
})
export default router
