import { DEFAULT_LAYOUT } from '@/router/constants';

export default {
  path: '/sensitive-word',
  name: 'SensitiveWord', // 和服务端的name一致
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.server.sensitiveWord',
    requiresAuth: true,
    icon: 'icon-renzheng',
    order: 0,
  },
  children: [
    {
      path: 'list',
      name: 'SensitiveWordList',
      component: () => import('@/views/sensitive-word/index.vue'),
      meta: {
        locale: 'menu.server.sensitiveWordList',
        requiresAuth: true,
        roles: ['1', '2', '3'],
      },
    },
    {
      path: 'review',
      name: 'SensitiveWordReview',
      component: () => import('@/views/sensitive-word/review.vue'),
      meta: {
        locale: 'menu.server.sensitiveWordReview',
        requiresAuth: true,
        roles: ['1', '2', '3'],
      },
    },
  ],
};
