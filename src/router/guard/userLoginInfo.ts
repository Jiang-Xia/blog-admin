import type { Router, LocationQueryRaw } from 'vue-router';
import NProgress from 'nprogress'; // progress bar

import { useUserStore } from '@/store';
import { isLogin } from '@/utils/auth';
import { WHITE_LIST } from '../constants';

export default function setupUserLoginInfoGuard(router: Router) {
  router.beforeEach(async (to) => {
    NProgress.start();
    const userStore = useUserStore();
    if (isLogin()) {
      if (userStore.role) {
        return true;
      } else {
        try {
          await userStore.getInfo();
          return true;
        } catch (error) {
          return {
            name: 'login',
            query: {
              redirect: to.name,
              ...to.query,
            } as LocationQueryRaw,
          };
        }
      }
    } else {
      // 检查是否在白名单中
      if (WHITE_LIST.some((item) => item.name === to.name)) {
        return true;
      }
      if (to.name === 'login') {
        return true;
      }
      return {
        name: 'login',
        query: {
          redirect: to.name,
          ...to.query,
        } as LocationQueryRaw,
      };
    }
  });
}
