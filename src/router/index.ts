import {
  createRouter,
  createWebHistory,
  // createWebHashHistory,
} from 'vue-router';
import NProgress from 'nprogress'; // progress bar
import 'nprogress/nprogress.css';

import { appRoutes } from './routes';
import createRouteGuard from './guard';

NProgress.configure({ showSpinner: false }); // NProgress Configuration

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: 'login',
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/login/index.vue'),
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: '/useTsx',
      name: 'useTsx',
      component: () => import('@/views/user/index.vue'),
      meta: {
        requiresAuth: false,
      },
    },
    ...appRoutes,
    {
      path: '/:pathMatch(.*)*',
      name: 'notFound',
      component: () => import('@/views/not-found/index.vue'),
    },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

// 使用百度统计 &符号 交叉类型
type W = { _hmt: any };
declare const window: Window & W;
router.afterEach((to: any) => {
  // 每次进入路由都会触发
  /* eslint-disable */
  if (window._hmt) {
    if (to.path) {
      window._hmt.push(['_setAutoPageview', false]);
      window._hmt.push([
        '_trackPageview',
        `/template/displayTemplate/dist/index.html#${to.fullPath}`,
      ]); // 如果不是根路径，需要指定第二个参数的路径
    }
  }
  /* eslint-disable */
});
createRouteGuard(router);

export default router;
