import type { RouteRecordRaw } from 'vue-router'

export const B0400_ROUTE: RouteRecordRaw[] = [
  {
    path: 'b0400',
    name: 'b0400',
    component: () => import('@/views/b0000/b0400/pages/b0400-questions.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: 'b0400/new',
    name: 'b0400_new',
    component: () => import('@/views/b0000/b0400/pages/b0400-question-editor.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: 'b0400/:id',
    name: 'b0400_edit',
    component: () => import('@/views/b0000/b0400/pages/b0400-question-editor.vue'),
    meta: { requiresAuth: true },
  },  
  {
    path: 'b0400/quiz',
    name: 'b0400_quiz',
    component: () => import('@/views/b0000/b0400/pages/b0400-quiz.vue'),
    meta: { requiresAuth: true },
  },
]
