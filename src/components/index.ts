/**
 * 全局业务组件注册（不含图表）
 * Chart/ECharts 仅在工作台、数据大屏等页面按需引入，避免登录首包 preload。
 */
import type { App } from 'vue';
import Breadcrumb from './breadcrumb/index.vue';
import TablePagination from './table-pagination/index.vue';
import XIcon from './x-icon/index';

export default {
  install(Vue: App) {
    Vue.component('Breadcrumb', Breadcrumb);
    Vue.component('TablePagination', TablePagination);
    Vue.component('XIcon', XIcon);
  },
};
