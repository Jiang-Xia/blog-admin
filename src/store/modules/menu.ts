import { defineStore } from 'pinia'

interface MenuState {
  list: Menu.MenuItem[]
}

export const useMenuStore = defineStore({
  id: 'Menu',
  state: (): MenuState => {
    return {
      list: [
        {
          icon: 'menu-work',
          id: 'YBP',
          name: '仪表盘',
          path: '/',
          keepAlive: false,
          hidden: false
          // children: [
          //   {
          //     id: 'GZT',
          //     name: '工作台',
          //     path: '/home',
          //     keepAlive: false,
          //     hidden: false
          //   }
          // ]
        },
        {
          icon: 'menu-indicator',
          id: 'ZBGL',
          name: '文章管理',
          path: '/article-manage',
          keepAlive: true,
          hidden: false,
          children: [
            {
              id: 'article-list',
              name: '文章列表',
              path: '/article-manage/list',
              keepAlive: false,
              hidden: false
            },
            {
              id: 'article-add',
              name: '新增文章',
              path: '/article-manage/add',
              keepAlive: false,
              hidden: false
            },
            {
              id: 'article-edit',
              name: '编辑文章',
              path: '/article-manage/add',
              keepAlive: false,
              hidden: false
            }
          ]
        },
        {
          icon: 'menu-edit',
          id: 'article-tag',
          name: '文章标签',
          path: '/article-tag',
          keepAlive: true,
          hidden: false
        },
        // {
        //   icon: 'menu-form',
        //   id: 'BDGL',
        //   name: '表单管理',
        //   path: '/form-manage',
        //   keepAlive: true,
        //   hidden: false,
        //   children: [
        //     {
        //       id: 'JCBD',
        //       name: '基础表单',
        //       path: '/form-manage/base-form',
        //       keepAlive: false,
        //       hidden: false
        //     },
        //     {
        //       id: 'FBBD',
        //       name: '分步表单',
        //       path: '/form-manage/step-form',
        //       keepAlive: false,
        //       hidden: false
        //     }
        //   ]
        // },
        {
          icon: 'menu-table',
          id: 'article-category',
          name: '文章分类',
          path: '/article-category',
          keepAlive: true,
          hidden: false
        },
        {
          icon: 'menu-test',
          id: 'TEST',
          name: '测试页',
          path: '/test',
          keepAlive: false,
          hidden: false
        },
        {
          icon: 'menu-about',
          id: 'ABOUT',
          name: '关于',
          path: '/about',
          keepAlive: false,
          hidden: false
        }
      ]
    }
  },
  getters: {},
  actions: {}
})
