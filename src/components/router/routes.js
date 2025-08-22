import { createRouter, createWebHistory } from 'vue-router'
import _ from 'lodash'
import content from '../common/page/content.json'
import Home from '../home/Home.vue'
import Master from '../common/page/Master.vue'

const routes = content.map((item) => {
  return {
    path: `/${item.entity.name}s`,
    name: `${item.entity.name.toLowerCase()}s`,
    component: Master,
    props: {
      entity: item.entity,
      fields: item.fields,
    },
  }
})
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), //use HTML5 history mode
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    ...routes,
    // {
    //   path: '/about',
    //   name: 'about',
    //   component: () => import('./components/about/About.vue'), //lazy loading
    // }
    {
      path: '/resetpassword',
      name: 'resetpassword',
      component: () => import('../login/FormRecover.vue'), //lazy loading
      props: (route) => ({
        id: route.query.id ?? null,
        random: route.query.random ?? null,
      }),
    },
  ],
})
export default router
