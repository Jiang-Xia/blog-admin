import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { Message, Modal } from '@arco-design/web-vue';
import { useUserStore } from '@/store';
import { getToken } from '@/utils/auth';
import { baseUrl } from '@/config';
import { aesEncrypt, aesDecrypt } from '@/utils/crypto';

// 线上“紧急开关”：本地缓存有值则关闭加密（key 需尽量隐晦，避免被随意调试）
// 规则：长一些 + 含项目指纹（admin）但不直白暴露项目名/用途
const DISABLE_ENCRYPT_STORAGE_KEY = '__bxp__spa_admin__k3Y9p2__fuse__v1';
const openEncryptByEnv = import.meta.env.VITE_NUXT_OPEN_ENCRYPT === 'true';
const openEncrypt =
  openEncryptByEnv &&
  (() => {
    // 线上部署时支持通过本地缓存一键关闭加密（有值即关闭）
    if (import.meta.env.MODE !== 'production') {
      return true;
    }
    try {
      return !localStorage.getItem(DISABLE_ENCRYPT_STORAGE_KEY);
    } catch {
      return true;
    }
  })();
// 加密请求 body
const encryptMsg = (body: any, url: string) => {
  const bool = url.includes('encrypt');
  if (bool && body) {
    // console.log('encryptMsg-body====>', JSON.stringify(body));
    body = aesEncrypt(JSON.stringify(body));
    // console.log('encryptMsg-body====>', body)
    // console.log('encryptMsg-body====>', { content: body, })
    return {
      content: body,
    };
  }
  return body;
};

// 解密响应 body
const decryptMsg = (body: any, url: string) => {
  const bool = url.includes('encrypt');
  if (bool && body && body.content) {
    body = aesDecrypt(body.content);
    body = JSON.parse(body);
    // console.log('decryptMsg-body', body);
    return body;
  }
  return body;
};

// 自定义请求和相应拦截器
export interface HttpResponse<T = unknown> {
  status: number;
  message: string;
  code: number;
  bizCode: number;
  data: T;
}

export interface AppRequestError {
  code: number | string;
  bizCode: number | string;
  message: string;
  status?: number;
  requestId?: string;
  cause?: unknown;
}
function errorMsg(msg: string) {
  Message.error(msg);
}
const request = axios.create();
// 设置代理需配置不能为全网址
request.defaults.baseURL = baseUrl;
if (openEncrypt) {
  request.defaults.baseURL = `${baseUrl}/encrypt`;
}
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // let each request carry token
    // this example using the JWT token
    // Authorization is a custom headers key
    // please modify it according to the actual situation
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // console.log('token2: ', config.headers.Authorization);
    }
    config.data = encryptMsg(config.data, config.baseURL as string);
    return config;
  },
  (error) => {
    // do something
    return Promise.reject(error);
  },
);
// add response interceptors
request.interceptors.response.use(
  (response: AxiosResponse<HttpResponse>) => {
    const res = decryptMsg(response.data, response.config.baseURL as string);
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
    const base = error.response?.config?.baseURL as string | undefined;
    const rawData = error.response && error.response.data;
    // 开启加密时，后端异常也可能是加密包裹的 { content }，这里需要同步解密才能拿到真实 message/bizCode
    let data: any = rawData;
    try {
      if (base && typeof base === 'string') {
        data = decryptMsg(rawData, base);
      }
    } catch {
      data = rawData;
    }
    // 统一错误结构，方便调用方按 code/status/requestId 做精细化处理。
    const requestId =
      error.response?.headers?.['x-request-id'] || error.response?.headers?.['request-id'];
    const requestError: AppRequestError = {
      code: data?.code ?? error.response?.status ?? 'UNKNOWN_ERROR',
      bizCode: data?.bizCode ?? error.response?.status ?? 'UNKNOWN_ERROR',
      message: data?.message || error.message || '请求失败',
      status: error.response?.status,
      requestId,
      cause: error,
    };

    if (error.response) {
      switch (error.response.status) {
        case 401:
          errorMsg(requestError.message || '权限不足');
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
          errorMsg(requestError.message || '网络请求不存在');
          break;
        default:
          errorMsg(requestError.message || '请求失败');
      }
    } else if (error.message.includes('timeout')) {
      // 请求超时或者网络有问题
      errorMsg('请求超时，请稍后重试');
    } else {
      errorMsg('请求失败，请检查网络是否已连接');
    }
    return Promise.reject(requestError);
  },
);

export default request;
