import { DEFAULT_LAYOUT } from '@/router/constants';

export default {
  path: '/ext-apps',
  name: 'ExtApps',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.server.extApps',
    requiresAuth: true,
    icon: 'icon-apps',
    order: 5,
  },
  children: [
    {
      path: 'pay-order',
      name: 'PayOrder',
      component: () => import('@/views/pay-order/index.vue'),
      meta: {
        locale: 'menu.server.payOrder',
        requiresAuth: true,
        roles: ['1', '2', '3'],
      },
    },
  ],
};
