import { DEFAULT_LAYOUT } from '@/router/constants';

export default {
  path: '/log',
  name: 'Log',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.server.log',
    requiresAuth: true,
    icon: 'icon-gongzuorenwu',
    order: 0,
  },
  children: [
    {
      path: 'operation-log',
      name: 'OperationLog',
      component: () => import('@/views/operation-log/index.vue'),
      meta: {
        locale: 'menu.server.operationLog',
        requiresAuth: true,
        roles: ['1', '2', '3'],
      },
    },
    {
      path: 'scheduled-task',
      name: 'ScheduledTask',
      component: () => import('@/views/scheduled-task/index.vue'),
      meta: {
        locale: 'menu.server.scheduledTask',
        requiresAuth: true,
        roles: ['1', '2', '3'],
      },
    },
  ],
};
