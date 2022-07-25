import { DEFAULT_LAYOUT } from '@/router/constants';

export default {
  path: '/link',
  name: 'Link', // 和服务端的name一致
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.server.link',
    requiresAuth: true,
    icon: 'icon-link', // 服务端menu时用不上
    order: 0,
  },
  children: [
    {
      path: 'list',
      name: 'LinkList',
      component: () => import('@/views/link/index.vue'),
      meta: {
        locale: 'menu.server.linkList', // 服务端menu时用不上
        requiresAuth: true,
        roles: ['*'],
      },
    },
  ],
};
