import { DEFAULT_LAYOUT } from '@/router/constants';

export default {
  path: '/system',
  name: 'System', // 和服务端的name一致
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.server.system',
    requiresAuth: true,
    icon: 'icon-settings',
    order: 0,
  },
  children: [
    {
      path: '/system/userManage',
      name: 'UserManage',
      component: () => import('@/views/system/user.vue'),
      meta: {
        locale: 'menu.server.userManage',
        requiresAuth: true,
        roles: ['*'],
      },
    },
    {
      path: '/system/menuManage',
      name: 'MenuManage',
      component: () => import('@/views/system/menu.vue'),
      meta: {
        locale: 'menu.server.userManage',
        requiresAuth: true,
        roles: ['*'],
      },
    },
    {
      path: '/system/roleManage',
      name: 'RoleManage',
      component: () => import('@/views/system/role.vue'),
      meta: {
        locale: 'menu.server.roleManage',
        requiresAuth: true,
        roles: ['*'],
      },
    },
    {
      path: '/system/privilegeManage',
      name: 'PrivilegeManage',
      component: () => import('@/views/system/privilege.vue'),
      meta: {
        locale: 'menu.server.privilegeManage',
        requiresAuth: true,
        roles: ['*'],
      },
    },
    {
      path: '/system/deptManage',
      name: 'DeptManage',
      component: () => import('@/views/system/dept.vue'),
      meta: {
        locale: 'menu.server.deptManage',
        requiresAuth: true,
        roles: ['*'],
      },
    },
  ],
};
