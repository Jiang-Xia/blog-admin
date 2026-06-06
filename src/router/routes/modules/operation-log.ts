import { DEFAULT_LAYOUT } from '@/router/constants';

export default {
  path: '/operation-log',
  name: 'OperationLog',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.server.operationLog',
    requiresAuth: true,
    icon: 'icon-biji',
    order: 0,
  },
  children: [
    {
      path: 'list',
      name: 'OperationLogList',
      component: () => import('@/views/operation-log/index.vue'),
      meta: {
        locale: 'menu.server.operationLogList',
        requiresAuth: true,
        roles: ['1', '2', '3'],
      },
    },
  ],
};
