import { useRoute, type RouteLocationNormalized } from 'vue-router';
import { defineStore } from 'pinia';
import type { TabBarState, TagProps } from './types';

const formatTag = (route: RouteLocationNormalized): TagProps => {
  const { name, meta, fullPath, query } = route;
  return {
    title: meta.locale || '',
    name: String(name),
    fullPath,
    query,
  };
};

const useTabBarStore = defineStore('tabBar', {
  state: (): TabBarState => ({
    cacheTabList: new Set(),
    tagList: [
      // Set the first element dynamically as needed
      // 动态设置第一个打开的路由 （工作台一定得有，不然默认打开路由找不到会调整到 not fund）
      {
        title: 'menu.dashboard.workplace',
        name: 'Workplace',
        fullPath: '/dashboard/workplace',
      },
    ],
  }),

  getters: {
    getTabList(): TagProps[] {
      return this.tagList;
    },
    getCacheList(): string[] {
      return Array.from(this.cacheTabList);
    },
  },

  actions: {
    updateTabList(route: RouteLocationNormalized) {
      this.tagList.push(formatTag(route));
      if (!route.meta.ignoreCache) {
        this.cacheTabList.add(route.name as string);
      }
    },
    deleteTag(idx: number, tag: TagProps) {
      this.tagList.splice(idx, 1);
      this.cacheTabList.delete(tag.name);
    },
    // route 当前页面路由信息
    deleteCurrentTag(route: any) {
      const idx = this.tagList.findIndex((tag) => tag.fullPath === route.fullPath);
      const tag = this.tagList[idx];
      this.tagList.splice(idx, 1);
      this.cacheTabList.delete(tag.name);
    },
    deleteAllTag() {
      this.tagList = [
        {
          title: 'menu.dashboard.workplace',
          name: 'Workplace',
          fullPath: '/dashboard/workplace',
        },
      ];
      this.cacheTabList = new Set();
    },
  },
});

export default useTabBarStore;
