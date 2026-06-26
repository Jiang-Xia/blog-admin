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
    {
      path: 'rpg',
      name: 'RpgManage',
      meta: {
        locale: 'menu.server.rpgManage',
        requiresAuth: true,
        icon: 'icon-trophy',
      },
      children: [
        {
          path: 'achievement',
          name: 'RpgAchievement',
          component: () => import('@/views/rpg/achievement.vue'),
          meta: {
            locale: 'menu.server.rpgAchievement',
            requiresAuth: true,
            roles: ['1', '2'],
          },
        },
        {
          path: 'quest',
          name: 'RpgQuest',
          component: () => import('@/views/rpg/quest.vue'),
          meta: {
            locale: 'menu.server.rpgQuest',
            requiresAuth: true,
            roles: ['1', '2'],
          },
        },
        {
          path: 'lottery',
          name: 'RpgLottery',
          component: () => import('@/views/rpg/lottery.vue'),
          meta: {
            locale: 'menu.server.rpgLottery',
            requiresAuth: true,
            roles: ['1', '2'],
          },
        },
        {
          path: 'user',
          name: 'RpgUser',
          component: () => import('@/views/rpg/user.vue'),
          meta: {
            locale: 'menu.server.rpgUser',
            requiresAuth: true,
            roles: ['1', '2'],
          },
        },
        {
          path: 'item-config',
          name: 'RpgItemConfig',
          component: () => import('@/views/rpg/item-config.vue'),
          meta: {
            locale: 'menu.server.rpgItemConfig',
            requiresAuth: true,
            roles: ['1', '2'],
          },
        },
        {
          path: 'activity',
          name: 'RpgActivity',
          component: () => import('@/views/rpg/activity.vue'),
          meta: {
            locale: 'menu.server.rpgActivity',
            requiresAuth: true,
            roles: ['1', '2'],
          },
        },
        {
          path: 'guild',
          name: 'RpgGuild',
          component: () => import('@/views/rpg/guild.vue'),
          meta: {
            locale: 'menu.server.rpgGuild',
            requiresAuth: true,
            roles: ['1', '2'],
          },
        },
        {
          path: 'social-log',
          name: 'RpgSocialLog',
          component: () => import('@/views/rpg/social-log.vue'),
          meta: {
            locale: 'menu.server.rpgSocialLog',
            requiresAuth: true,
            roles: ['1', '2'],
          },
        },
      ],
    },
    {
      path: 'rag/index',
      name: 'RagIndex',
      component: () => import('@/views/rag/index.vue'),
      meta: {
        locale: 'menu.server.ragIndex',
        requiresAuth: true,
        roles: ['1', '2'],
      },
    },
  ],
};
