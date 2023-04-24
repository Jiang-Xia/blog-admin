import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Message, Modal } from '@arco-design/web-vue';
import { useUserStore } from '@/store';
import { getToken } from '@/utils/auth';
import { baseUrl } from '@/config';
// 自定义请求和相应拦截器
export interface HttpResponse<T = unknown> {
  status: number;
  message: string;
  code: number;
  data: T;
}
function errorMsg(msg: string) {
  Message.error(msg);
}
const request = axios.create();
// 设置代理需配置不能为全网址
request.defaults.baseURL = baseUrl;

request.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // let each request carry token
    // this example using the JWT token
    // Authorization is a custom headers key
    // please modify it according to the actual situation
    const token = getToken();
    if (token) {
      if (!config.headers) {
        config.headers = {};
      }
      config.headers.Authorization = `Bearer ${token}`;
      // console.log('token2: ', config.headers.Authorization);
    }
    return config;
  },
  (error) => {
    // do something
    return Promise.reject(error);
  }
);
// add response interceptors
request.interceptors.response.use(
  (response: AxiosResponse<HttpResponse>) => {
    const res = response.data;
    const { status } = response; // http自带状态码
    // if the custom code is not 20000, it is judged as an error.
    if ((status >= 200 && status < 300) || status === 304) {
      return res;
    }
    Message.error({
      content: res.message || 'Error',
      duration: 5 * 1000,
    });
    return Promise.reject(new Error(res.message || 'Error'));
  },
  (error) => {
    console.error('error: ', error);
    const data = error.response && error.response.data;
    if (error.response) {
      switch (error.response.status) {
        case 401:
          errorMsg(data.message || '权限不足');
          Modal.error({
            title: '确认退出',
            content: '您的登录超时了，您可以重新登录。',
            okText: '去登录',
            async onOk() {
              const userStore = useUserStore();
              await userStore.logout();
              window.location.href = '/';
            },
          });
          break;
        case 404:
          errorMsg(data.message || '网络请求不存在');
          break;
        default:
          errorMsg((data && data.message) || '请求失败');
      }
    } else if (error.message.includes('timeout')) {
      // 请求超时或者网络有问题
    } else {
      errorMsg('请求失败，请检查网络是否已连接');
    }
    return Promise.reject(data);
  }
);

export default request;
