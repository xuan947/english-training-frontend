import { createRouter, createWebHashHistory  } from 'vue-router'
import TheLayout from '@/layouts/the-layout.vue'
import HomeView from '@/views/index.vue'
import { FUNC_B0000 } from '@/views/b0000/b0000-route'

export default createRouter({
  history: createWebHashHistory (import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: TheLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: HomeView,
        },
        ...FUNC_B0000,
      ],
    },
  ],
})
