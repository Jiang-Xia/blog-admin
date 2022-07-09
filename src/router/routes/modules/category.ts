import { DEFAULT_LAYOUT } from '@/router/constants';

export default {
  path: '/category',
  name: 'Category', // 和服务端的name一致
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.server.category',
    requiresAuth: true,
    icon: 'icon-sort', // 服务端menu时用不上
    order: 0,
  },
  children: [
    {
      path: 'list',
      name: 'CategoryList',
      component: () => import('@/views/category/list.vue'),
      meta: {
        locale: 'menu.server.categoryList', // 服务端menu时用不上
        requiresAuth: true,
        roles: ['*'],
      },
    },
  ],
};
