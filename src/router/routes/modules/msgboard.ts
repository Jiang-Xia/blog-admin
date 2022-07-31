import { DEFAULT_LAYOUT } from '@/router/constants';

export default {
  path: '/msgboard',
  name: 'Msgboard', // 和服务端的name一致
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.server.msgboard',
    requiresAuth: true,
    icon: 'icon-msgboard', // 服务端menu时用不上
    order: 0,
  },
  children: [
    {
      path: 'list',
      name: 'MsgboardList',
      component: () => import('@/views/msgboard/index.vue'),
      meta: {
        locale: 'menu.server.msgboardList', // 服务端menu时用不上
        requiresAuth: true,
        roles: ['*'],
      },
    },
  ],
};
