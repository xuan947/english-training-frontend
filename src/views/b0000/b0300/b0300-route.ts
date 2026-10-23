import type { RouteRecordRaw } from 'vue-router';

export const B0300_ROUTE: RouteRecordRaw[] = [
  {
    path: 'b0300',
    name: 'b0300',
    component: () => import('@/views/b0000/b0300/b0300.vue'),
    meta: {
      requiresAuth: true,
    },
  },
];
