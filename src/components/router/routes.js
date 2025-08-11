import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), //use HTML5 history mode
  routes: [
    // {
    //   path: '/',
    //   name: 'home',
    //   component: Home,
    // },
    // {
    //   path: '/about',
    //   name: 'about',
    //   component: () => import('./components/about/About.vue'), //lazy loading
    // },
  ],
})

export default router
