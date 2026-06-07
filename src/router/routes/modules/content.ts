import { DEFAULT_LAYOUT } from '@/router/constants';

export default {
  path: '/content',
  name: 'Content', // 和服务端的name一致
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.server.content',
    requiresAuth: true,
    icon: 'icon-book',
    order: 1,
  },
  children: [
    {
      path: 'article',
      name: 'Article',
      meta: {
        locale: 'menu.server.article',
        requiresAuth: true,
        icon: 'icon-biji',
      },
      children: [
        {
          path: 'list',
          name: 'ArticleList',
          component: () => import('@/views/article/list.vue'),
          meta: {
            locale: 'menu.server.articleList',
            requiresAuth: true,
            roles: ['1', '2', '3'],
          },
        },
        {
          path: 'edit',
          name: 'ArticleEdit',
          component: () => import('@/views/article/edit.vue'),
          meta: {
            locale: 'menu.server.articleEdit',
            requiresAuth: true,
          },
        },
      ],
    },
    {
      path: 'category',
      name: 'Category',
      meta: {
        locale: 'menu.server.category',
        requiresAuth: true,
        icon: 'icon-fenlei1',
      },
      children: [
        {
          path: 'list',
          name: 'CategoryList',
          component: () => import('@/views/category/list.vue'),
          meta: {
            locale: 'menu.server.categoryList',
            requiresAuth: true,
            roles: ['1', '2', '3'],
          },
        },
      ],
    },
    {
      path: 'tag',
      name: 'Tag',
      meta: {
        locale: 'menu.server.tag',
        requiresAuth: true,
        icon: 'icon-biaoqian',
      },
      children: [
        {
          path: 'list',
          name: 'TagList',
          component: () => import('@/views/tag/list.vue'),
          meta: {
            locale: 'menu.server.tagList',
            requiresAuth: true,
            roles: ['1', '2', '3'],
          },
        },
      ],
    },
    {
      path: 'resource',
      name: 'Resources',
      meta: {
        locale: 'menu.server.resource',
        requiresAuth: true,
        icon: 'icon-wenjianjia1',
      },
      children: [
        {
          path: 'list',
          name: 'ResourceList',
          component: () => import('@/views/resource/list.vue'),
          meta: {
            locale: 'menu.server.resourceList',
            requiresAuth: true,
            roles: ['1', '2', '3'],
          },
        },
      ],
    },
  ],
};
