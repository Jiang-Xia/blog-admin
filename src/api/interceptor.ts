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
if (import.meta.env.VITE_API_BASE_URL) {
  axios.defaults.baseURL = baseUrl;
}

axios.interceptors.request.use(
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
axios.interceptors.response.use(
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
    console.log('error: ', error.response);
    if (error.response) {
      const data = error.response && error.response.data;
      switch (error.response.status) {
        case 401:
          errorMsg(data.message || '权限不足');
          // Modal.error({
          //   title: 'Confirm logout',
          //   content:
          //     'You have been logged out, you can cancel to stay on this page, or log in again',
          //   okText: 'Re-Login',
          //   async onOk() {
          //     const userStore = useUserStore();

          //     await userStore.logout();
          //     window.location.reload();
          //   },
          // });
          break;
        case 404:
          errorMsg(data.message || '网络请求不存在');
          break;
        default:
          errorMsg(data.message);
      }
    } else if (error.message.includes('timeout')) {
      // 请求超时或者网络有问题
    } else {
      errorMsg('请求失败，请检查网络是否已连接');
    }
    return Promise.reject(error);
  }
);
