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
