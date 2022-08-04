import { DEFAULT_LAYOUT } from '@/router/constants';

export default {
  path: '/article',
  name: 'Article', // 和服务端的name一致
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.server.article',
    requiresAuth: true,
    icon: 'icon-book', // 服务端menu时用不上
    order: 0,
  },
  children: [
    {
      path: '/article/list',
      name: 'ArticleList',
      component: () => import('@/views/article/list.vue'),
      meta: {
        locale: 'menu.server.articleList', // 服务端menu时用不上
        requiresAuth: true,
        roles: ['*'],
      },
    },
    {
      path: '/article/edit',
      name: 'ArticleEdit',
      component: () => import('@/views/article/edit.vue'),
      meta: {
        locale: 'menu.server.articleEdit',
        requiresAuth: true,
      },
    },
  ],
};
