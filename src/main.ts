import { createApp } from 'vue';
import globalComponents from '@/components';
import dayjs from 'dayjs';
import router from './router';
import store from './store';
import i18n from './locale';
import directive from './directive';

// import './mock';
import App from './App.vue';
/**
 * Arco 按需：不注册全量 ArcoVue / ArcoVueIcon。
 * - 组件与 Icon：unplugin-vue-components + ArcoResolver(sideEffect)
 * - 全局 token / normalize / icon 基础类：es/style（不含各组件样式）
 * - Message / Modal / Notification：脚本内手动 import，需单独引入样式
 */
import '@arco-design/web-vue/es/style/index.less';
import '@arco-design/web-vue/es/message/style/css.js';
import '@arco-design/web-vue/es/modal/style/css.js';
import '@arco-design/web-vue/es/notification/style/css.js';
import '@/assets/style/index.less';

const app = createApp(App);

app.use(router);
app.use(store);
app.use(i18n);
app.use(globalComponents);
app.use(directive);
app.config.globalProperties.$dayjs = dayjs;
app.mount('#app');
