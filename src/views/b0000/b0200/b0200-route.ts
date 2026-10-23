import type { RouteRecordRaw } from 'vue-router';

export const B0200_ROUTE: RouteRecordRaw[] = [
  {
    path: 'b0200',
    name: 'b0200',
    component: () => import('@/views/b0000/b0200/b0200.vue'),
    meta: {
      requiresAuth: true,
    },
  },
];
