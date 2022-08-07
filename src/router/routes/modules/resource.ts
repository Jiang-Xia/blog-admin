import { DEFAULT_LAYOUT } from '@/router/constants';

export default {
  path: '/resource',
  name: 'Resource', // 和服务端的name一致
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.server.resource',
    requiresAuth: true,
    icon: 'icon-file',
    order: 0,
  },
  children: [
    {
      path: '/resource/list',
      name: 'ResourceList',
      component: () => import('@/views/resource/list.vue'),
      meta: {
        locale: 'menu.server.resourceList',
        requiresAuth: true,
        roles: ['*'],
      },
    },
  ],
};
