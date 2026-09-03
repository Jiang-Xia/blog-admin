import { createApp } from 'vue';
import globalComponents from '@/components';
import dayjs from 'dayjs';
import router from './router';
import store from './store';
import i18n from './locale';
import directive from './directive';

// import './mock';
import App from './App.vue';
import '@/assets/style/index.less';
// Message/Modal/Notification 为命令式 API，组件 Resolver 不会注入样式，需显式引入
import '@arco-design/web-vue/es/message/style/css.js';
import '@arco-design/web-vue/es/modal/style/css.js';
import '@arco-design/web-vue/es/notification/style/css.js';

const app = createApp(App);

app.use(router);
app.use(store);
app.use(i18n);
app.use(globalComponents);
app.use(directive);
app.config.globalProperties.$dayjs = dayjs;
app.mount('#app');
