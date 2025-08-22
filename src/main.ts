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
