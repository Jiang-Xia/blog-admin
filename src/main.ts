import { createApp } from 'vue';
import ArcoVue from '@arco-design/web-vue';
import ArcoVueIcon from '@arco-design/web-vue/es/icon';
import globalComponents from '@/components';
import dayjs from 'dayjs';
import router from './router';
import store from './store';
import i18n from './locale';
import directive from './directive';

// import './mock';
import App from './App.vue';
// 全量主题 CSS：业务 less 依赖 --color-bg-* / --arcoblue-* 等变量；仅按需组件样式会漏 token
import '@arco-design/web-vue/dist/arco.less';
import '@/assets/style/index.less';
import 'md-editor-v3/lib/style.css';

const app = createApp(App);

app.use(ArcoVue, { componentPrefix: 'a' });
app.use(ArcoVueIcon);
app.use(router);
app.use(store);
app.use(i18n);
app.use(globalComponents);
app.use(directive);
app.config.globalProperties.$dayjs = dayjs;
app.mount('#app');
