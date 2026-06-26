import { defineComponent, ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter, type RouteRecordRaw } from 'vue-router';
import type { RouteMeta } from 'vue-router';
import { useAppStore } from '@/store';
import { listenerRouteChange } from '@/utils/route-listener';
import { openWindow, regexUrl } from '@/utils';
import useMenuTree from './useMenuTree';
import XIcon from '@/components/x-icon';
import './index.less';

export default defineComponent({
  emit: ['collapse'],
  setup() {
    const { t } = useI18n();
    const appStore = useAppStore();
    const router = useRouter();
    const route = useRoute();
    const { menuTree } = useMenuTree();
    const collapsed = computed({
      get() {
        if (appStore.device === 'desktop') return appStore.menuCollapse;
        return false;
      },
      set(value: boolean) {
        appStore.updateSettings({ menuCollapse: value });
      },
    });

    const openKeys = ref<string[]>([]);
    const selectedKey = ref<string[]>([]);

    const goto = (item: RouteRecordRaw) => {
      // Open external link
      if (regexUrl.test(item.path)) {
        openWindow(item.path);
        selectedKey.value = [item.name as string];
        return;
      }
      // Eliminate external link side effects
      const { hideInMenu, activeMenu } = item.meta as RouteMeta;
      if (route.name === item.name && !hideInMenu && !activeMenu) {
        selectedKey.value = [item.name as string];
        return;
      }
      // Trigger router change
      router.push({
        name: item.name,
      });
    };
    const findMenuOpenKeys = (name: string) => {
      const result: string[] = [];
      let isFind = false;
      const backtrack = (item: RouteRecordRaw, keys: string[], target: string) => {
        if (item.name === target) {
          isFind = true;
          result.push(...keys, item.name as string);
          return;
        }
        if (item.children?.length) {
          item.children.forEach((el) => {
            backtrack(el, [...keys, item.name as string], target);
          });
        }
      };
      menuTree.value.forEach((el: RouteRecordRaw) => {
        if (isFind) return; // Performance optimization
        backtrack(el, [], name);
      });
      return result;
    };
    const syncMenuState = (targetRoute: typeof route) => {
      const { requiresAuth, activeMenu, hideInMenu } = targetRoute.meta;
      if (requiresAuth && (!hideInMenu || activeMenu)) {
        const menuOpenKeys = findMenuOpenKeys((activeMenu || targetRoute.name) as string);
        if (!menuOpenKeys.length) return;

        const keySet = new Set([...menuOpenKeys, ...openKeys.value]);
        openKeys.value = [...keySet];

        selectedKey.value = [activeMenu || menuOpenKeys[menuOpenKeys.length - 1]];
      }
    };
    listenerRouteChange((newRoute) => {
      syncMenuState(newRoute);
    }, true);
    // 服务端菜单异步加载后 menuTree 才就绪，需重新计算展开项
    watch(menuTree, () => {
      syncMenuState(route);
    });
    const setCollapse = (val: boolean) => {
      if (appStore.device === 'desktop') appStore.updateSettings({ menuCollapse: val });
    };

    const renderSubMenu = () => {
      function travel(_route: RouteRecordRaw[], nodes = []) {
        if (_route) {
          _route.forEach((element) => {
            // This is demo, modify nodes as needed
            const icon = element?.meta?.icon
              ? () => <XIcon icon={element?.meta?.icon as string} />
              : null;
            const node =
              element?.children && element?.children.length !== 0 ? (
                <a-sub-menu
                  key={element?.name}
                  v-slots={{
                    icon,
                    title: () => (element?.meta?.locale ? t(element?.meta?.locale) : ''),
                  }}
                >
                  {travel(element?.children)}
                </a-sub-menu>
              ) : (
                <a-menu-item key={element?.name} v-slots={{ icon }} onClick={() => goto(element)}>
                  {element?.meta?.locale ? t(element?.meta?.locale) : ''}
                </a-menu-item>
              );
            nodes.push(node as never);
          });
        }
        return nodes;
      }
      return travel(menuTree.value);
    };

    return () => (
      <a-menu
        v-model:collapsed={collapsed.value}
        v-model:open-keys={openKeys.value}
        show-collapse-button={appStore.device !== 'mobile'}
        auto-open={false}
        selected-keys={selectedKey.value}
        auto-open-selected={true}
        level-indent={34}
        style="height: 100%"
        onCollapse={setCollapse}
        accordion
      >
        {renderSubMenu()}
      </a-menu>
    );
  },
});
