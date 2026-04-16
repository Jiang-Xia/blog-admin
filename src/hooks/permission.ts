import type { RouteLocationNormalized, RouteRecordRaw } from 'vue-router';
import { useUserStore } from '@/store';
import { hasAnyRole, normalizeRole } from '@/utils/role';

export default function usePermission() {
  const userStore = useUserStore();
  return {
    accessRouter(route: RouteLocationNormalized | RouteRecordRaw) {
      // 路由鉴权统一走角色工具，避免各处判断规则不一致。
      return (
        !route.meta?.requiresAuth ||
        !route.meta?.roles ||
        hasAnyRole(
          route.meta?.roles as string[] | undefined,
          userStore.roles as Array<Record<string, unknown>>,
        )
      );
    },
    findFirstPermissionRoute(_routers: RouteRecordRaw[], role = '1') {
      const cloneRouters: RouteRecordRaw[] = [..._routers];

      while (cloneRouters.length) {
        const firstElement = cloneRouters.shift() as RouteRecordRaw | undefined;
        if (
          firstElement?.meta?.roles?.find((el: string) => {
            return normalizeRole(el) === '*' || normalizeRole(el) === normalizeRole(role);
          })
        )
          return { name: firstElement.name };
        if (firstElement?.children) {
          cloneRouters.push(...firstElement.children);
        }
      }
      return null;
    },
    // You can add any rules you want
  };
}
