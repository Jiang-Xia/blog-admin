import type { Router, RouteRecordNormalized } from 'vue-router';
import NProgress from 'nprogress'; // progress bar

import usePermission from '@/hooks/permission';
import { useUserStore, useAppStore } from '@/store';
import { getToken } from '@/utils/auth';
import { appRoutes } from '../routes';
import { WHITE_LIST, NOT_FOUND } from '../constants';

export default function setupPermissionGuard(router: Router) {
  router.beforeEach(async (to) => {
    const appStore = useAppStore();
    const userStore = useUserStore();
    // console.log({ uid: userStore.id });
    const Permission = usePermission();
    const permissionsAllow = Permission.accessRouter(to);
    const hasToken = getToken();

    // 使用 return 风格守卫，避免 next() 过时告警。
    if (!hasToken) {
      // 未登录 访问登录页或白名单直接next
      if (WHITE_LIST.some((v) => v.name === to.name)) {
        NProgress.done();
        return true;
      }
      // 访问其他页跳转login
      NProgress.done();
      return { name: 'login' };
    } else if (appStore.menuFromServer) {
      // 针对来自服务端的菜单配置进行处理
      // Handle routing configuration from the server

      // 根据需要自行完善来源于服务端的菜单配置的permission逻辑
      // Refine the permission logic from the server's menu configuration as needed
      if (!appStore.appAsyncMenus.length && !WHITE_LIST.find((el) => el.name === to.name)) {
        await appStore.fetchServerMenuConfig();
      }
      const serverMenuConfig = [...appStore.appAsyncMenus, ...WHITE_LIST];

      let exist = false;
      // console.log(
      //   'serverMenuConfig: ',
      //   serverMenuConfig,
      //   serverMenuConfig.length
      // );
      // 注意 路由 name 需要首字母大写。服务器路由中的路由name需要和动态导入的组件名字一致
      while (serverMenuConfig.length && !exist) {
        const element = serverMenuConfig.shift();
        if (element?.name === to.name) exist = true;
        // console.log('element,exist: ', element, exist);
        if (element?.children) {
          serverMenuConfig.push(...(element.children as unknown as RouteRecordNormalized[]));
        }
      }
      // console.log(
      //   'serverMenuConfig: ',
      //   serverMenuConfig,
      //   serverMenuConfig.length
      // );
      // console.log({ exist, permissionsAllow });
      // console.log({ fullPath: to.fullPath });

      if (exist && permissionsAllow) {
        NProgress.done();
        return true;
      }
      NProgress.done();
      return NOT_FOUND;
    } else {
      if (permissionsAllow) {
        NProgress.done();
        return true;
      }
      const destination =
        Permission.findFirstPermissionRoute(appRoutes, userStore.role) || NOT_FOUND;
      NProgress.done();
      return destination;
    }
  });
}
