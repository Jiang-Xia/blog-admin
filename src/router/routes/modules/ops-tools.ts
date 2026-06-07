import { DEFAULT_LAYOUT } from '@/router/constants';

export default {
  path: '/ops-tools',
  name: 'OpsTools',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.server.opsTools',
    requiresAuth: true,
    icon: 'icon-tool',
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
      meta: {
        locale: 'menu.server.scheduledTask',
        requiresAuth: true,
        icon: 'icon-schedule-task',
      },
      children: [
        {
          path: 'log',
          name: 'TaskLog',
          component: () => import('@/views/scheduled-task/index.vue'),
          meta: {
            locale: 'menu.server.taskLog',
            requiresAuth: true,
            roles: ['1', '2', '3'],
          },
        },
        {
          path: 'manage',
          name: 'TaskManage',
          component: () => import('@/views/task-manage/index.vue'),
          meta: {
            locale: 'menu.server.taskManage',
            requiresAuth: true,
            roles: ['1', '2', '3'],
          },
        },
      ],
    },
  ],
};
