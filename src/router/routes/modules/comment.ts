import { DEFAULT_LAYOUT } from '@/router/constants';

export default {
  path: '/comment',
  name: 'Comment', // 和服务端的name一致
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.server.comment',
    requiresAuth: true,
    icon: 'icon-comment', // 服务端menu时用不上
    order: 0,
  },
  children: [
    {
      path: 'list',
      name: 'CommentList',
      component: () => import('@/views/comment/index.vue'),
      meta: {
        locale: 'menu.server.commentList', // 服务端menu时用不上
        requiresAuth: true,
        roles: ['*'],
      },
    },
  ],
};
