import type { RouteRecordRaw } from 'vue-router'

export const B0100_ROUTE: RouteRecordRaw[] = [
  {
    path: 'b0100',
    name: 'b0100',
    component: () => import('@/views/b0000/b0100/B0100.vue'),
    meta: {
      requiresAuth: true,
    },
  },
]
