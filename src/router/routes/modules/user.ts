import { DEFAULT_LAYOUT } from '@/router/constants';

export default {
  path: '/user',
  name: 'User', // 和服务端的name一致
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.server.user',
    requiresAuth: true,
    icon: 'icon-user', // 服务端menu时用不上
    order: 0,
  },
  children: [
    {
      path: 'set',
      name: 'UserSet',
      component: () => import('@/views/user/index.vue'),
      meta: {
        locale: 'menu.server.userSet', // 服务端menu时用不上
        requiresAuth: true,
        roles: ['*'],
      },
    },
  ],
};
