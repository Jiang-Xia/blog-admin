import { DEFAULT_LAYOUT } from '@/router/constants';

export default {
  path: '/tag',
  name: 'Tag', // 和服务端的name一致
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.server.tag',
    requiresAuth: true,
    icon: 'icon-tag', // 服务端menu时用不上
    order: 0,
  },
  children: [
    {
      path: 'list',
      name: 'TagList',
      component: () => import('@/views/tag/list.vue'),
      meta: {
        locale: 'menu.server.tagList', // 服务端menu时用不上
        requiresAuth: true,
        roles: ['*'],
      },
    },
  ],
};
