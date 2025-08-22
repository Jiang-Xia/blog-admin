<script lang="ts">
  import { defineComponent, ref, h, compile, computed, type VNode, type VNodeChild } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRoute, useRouter, type RouteRecordRaw } from 'vue-router';
  import type { RouteMeta } from 'vue-router';
  import { useAppStore } from '@/store';
  import { listenerRouteChange } from '@/utils/route-listener';
  import { openWindow, regexUrl } from '@/utils';
  import useMenuTree from './useMenuTree';

  export default defineComponent({
    emits: ['collapse'],
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
        if (regexUrl.test(item.path)) {
          openWindow(item.path);
          selectedKey.value = [item.name as string];
          return;
        }
        const { hideInMenu, activeMenu } = item.meta as RouteMeta;
        if (route.name === item.name && !hideInMenu && !activeMenu) {
          selectedKey.value = [item.name as string];
          return;
        }
        router.push({ name: item.name });
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
              backtrack(el, [...keys], target);
            });
          }
        };
        menuTree.value.forEach((el: RouteRecordRaw) => {
          if (isFind) return;
          backtrack(el, [el.name as string], name);
        });
        return result;
      };

      listenerRouteChange((newRoute) => {
        const { requiresAuth, activeMenu, hideInMenu } = newRoute.meta;
        if (requiresAuth && (!hideInMenu || activeMenu)) {
          const menuOpenKeys = findMenuOpenKeys((activeMenu || newRoute.name) as string);
          const keySet = new Set([...menuOpenKeys, ...openKeys.value]);
          openKeys.value = [...keySet];
          selectedKey.value = [activeMenu || menuOpenKeys[menuOpenKeys.length - 1]];
        }
      }, true);

      const setCollapse = (val: boolean) => {
        if (appStore.device === 'desktop') appStore.updateSettings({ menuCollapse: val });
      };

      const travel = (_route: RouteRecordRaw[]): VNodeChild[] => {
        const nodes: VNode[] = [];
        if (!_route) return nodes;
        _route.forEach((element) => {
          const iconSlot = element?.meta?.icon
            ? () => h(compile(`<x-icon icon=${element?.meta?.icon} />`))
            : undefined;

          if (element?.children && element.children.length !== 0) {
            nodes.push(
              h(
                'a-sub-menu',
                { key: element?.name },
                {
                  icon: iconSlot,
                  title: () => h(compile(t(element?.meta?.locale || ''))),
                  default: () => travel(element.children as RouteRecordRaw[]),
                },
              ),
            );
          } else {
            nodes.push(
              h(
                'a-menu-item',
                { key: element?.name, onClick: () => goto(element) },
                {
                  icon: iconSlot,
                  default: () => t(element?.meta?.locale || ''),
                },
              ),
            );
          }
        });
        return nodes;
      };

      return () =>
        h(
          'a-menu',
          {
            'onCollapse': setCollapse,
            'style': 'height: 100%',
            'accordion': true,
            'show-collapse-button': appStore.device !== 'mobile',
            'auto-open': false,
            'auto-open-selected': true,
            'level-indent': 34,
            'v-model:collapsed': collapsed.value,
            'v-model:open-keys': openKeys.value,
            'selected-keys': selectedKey.value,
          },
          { default: () => travel(menuTree.value as RouteRecordRaw[]) },
        );
    },
  });
</script>

<style lang="less" scoped>
  :deep(.arco-menu-inner) {
    .arco-menu-inline-header {
      display: flex;
      align-items: center;
    }

    .arco-icon {
      &:not(.arco-icon-down) {
        font-size: 18px;
      }
    }
  }
</style>
