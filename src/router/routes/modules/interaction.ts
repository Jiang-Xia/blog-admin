import { DEFAULT_LAYOUT } from '@/router/constants';

export default {
  path: '/interaction',
  name: 'Interaction', // 和服务端的name一致
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.server.interaction',
    requiresAuth: true,
    icon: 'icon-message',
    order: 2,
  },
  children: [
    {
      path: 'comment',
      name: 'Comment',
      meta: {
        locale: 'menu.server.comment',
        requiresAuth: true,
        icon: 'icon-liuyanban',
      },
      children: [
        {
          path: 'list',
          name: 'CommentList',
          component: () => import('@/views/comment/index.vue'),
          meta: {
            locale: 'menu.server.commentList',
            requiresAuth: true,
            roles: ['1', '2', '3'],
          },
        },
      ],
    },
    {
      path: 'msgboard',
      name: 'Msgboard',
      meta: {
        locale: 'menu.server.msgboard',
        requiresAuth: true,
        icon: 'icon-liuyanban',
      },
      children: [
        {
          path: 'list',
          name: 'MsgboardList',
          component: () => import('@/views/msgboard/index.vue'),
          meta: {
            locale: 'menu.server.msgboardList',
            requiresAuth: true,
            roles: ['1', '2', '3'],
          },
        },
      ],
    },
    {
      path: 'link',
      name: 'Link',
      meta: {
        locale: 'menu.server.link',
        requiresAuth: true,
        icon: 'icon-lianjie',
      },
      children: [
        {
          path: 'list',
          name: 'LinkList',
          component: () => import('@/views/link/index.vue'),
          meta: {
            locale: 'menu.server.linkList',
            requiresAuth: true,
            roles: ['1', '2', '3'],
          },
        },
      ],
    },
  ],
};
