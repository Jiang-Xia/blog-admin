import { createRouter, createWebHashHistory } from 'vue-router'
import { useAppStore, useMenuStore } from '@/store'

export const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', keepAlive: false }
  },
  {
    path: '/',
    name: 'Layout',
    redirect: '/article-manage/list',
    component: () => import('@/layout/index.vue'),
    meta: { title: '首页', keepAlive: false },
    children: [
      {
        path: '/home',
        name: 'Home',
        component: () => import('@/views/home/index.vue'),
        meta: { title: '首页', keepAlive: false }
      },
      {
        path: '/article-manage/list',
        name: 'article-list',
        component: () => import('@/views/article-manage/list.vue'),
        meta: { title: '文章列表', keepAlive: false }
      },
      {
        path: '/article-manage/add',
        name: 'article-add',
        component: () => import('@/views/article-manage/add.vue'),
        meta: { title: '新增文章', keepAlive: false }
      },
      {
        path: '/article-manage/edit',
        name: 'article-edit',
        component: () => import('@/views/article-manage/add.vue'),
        meta: { title: '编辑文章', keepAlive: false }
      },
      {
        path: '/article-tag',
        name: 'article-tag',
        component: () => import('@/views/article-tag/index.vue'),
        meta: { title: '文章标签', keepAlive: false }
      },
      {
        path: '/article-category',
        name: 'article-category',
        component: () => import('@/views/article-category/index.vue'),
        meta: { title: '文章分类', keepAlive: false }
      },

      {
        path: '/about',
        name: 'About',
        component: () => import('@/views/about/index.vue'),
        meta: { title: '关于', keepAlive: false }
      },
      {
        path: '/test',
        name: 'Test',
        component: () => import('@/views/test/index.vue'),
        meta: { title: '测试页', keepAlive: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ left: 0, top: 0 })
})

router.beforeEach((to, from, next) => {
  const appStore = useAppStore()
  const menuStore = useMenuStore()
  console.log('to', to)
  // 设置侧边菜单栏的高亮路径
  const arr = menuStore.list.map((i) => i.path)
  console.log('arr', arr)
  if (arr.includes(to.path)) {
    appStore.setActivePath(to.path)
  }
  next()
})

export default router
