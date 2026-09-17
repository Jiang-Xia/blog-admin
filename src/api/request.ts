import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { Message, Modal } from '@arco-design/web-vue';
import { useUserStore } from '@/store';
import { getToken } from '@/utils/auth';
import { baseUrl } from '@/config';
import {
  createGatewayEnvelope,
  createGatewayKeyHeaders,
  openGatewayEnvelope,
  type GatewaySession,
} from '@/utils/gateway-crypto';

// 线上“紧急开关”：本地缓存有值则关闭加密
const DISABLE_ENCRYPT_STORAGE_KEY = '__bxp__spa_admin__k3Y9p2__fuse__v1';
const openEncryptByEnv = import.meta.env.VITE_NUXT_OPEN_ENCRYPT === 'true';
const openEncrypt =
  openEncryptByEnv &&
  (() => {
    if (import.meta.env.MODE !== 'production') {
      return true;
    }
    try {
      return !localStorage.getItem(DISABLE_ENCRYPT_STORAGE_KEY);
    } catch {
      return true;
    }
  })();

const isMultipartBody = (body: unknown): body is FormData => {
  return typeof FormData !== 'undefined' && body instanceof FormData;
};

/** 在 axios config 上挂载本请求网关会话，供响应拦截器验签解密 */
type GatewayAxiosConfig = InternalAxiosRequestConfig & {
  gatewaySession?: GatewaySession | null;
};

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
request.defaults.baseURL = baseUrl;
if (openEncrypt) {
  request.defaults.baseURL = `${baseUrl}/encrypt`;
}

request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const gwConfig = config as GatewayAxiosConfig;
    if (openEncrypt) {
      const data = config.data;
      if (data && !isMultipartBody(data)) {
        const packed = createGatewayEnvelope(data);
        config.data = packed.envelope;
        gwConfig.gatewaySession = packed.session;
      } else {
        // GET/DELETE/multipart：头传 encKey，响应仍加密
        const keyed = createGatewayKeyHeaders();
        config.headers = {
          ...(config.headers as Record<string, string>),
          ...keyed.headers,
        } as InternalAxiosRequestConfig['headers'];
        gwConfig.gatewaySession = keyed.session;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

request.interceptors.response.use(
  (response: AxiosResponse) => {
    const gwConfig = response.config as GatewayAxiosConfig;
    let res: any = response.data;
    if (openEncrypt && res?.content && res?.iv && gwConfig.gatewaySession) {
      res = openGatewayEnvelope(res, gwConfig.gatewaySession);
    }
    const { status } = response;
    if ((status >= 200 && status < 300) || status === 304) {
      if (res?.code !== undefined && res.code !== 200) {
        Message.error(res.message || 'Error');
        return Promise.reject(new Error(res.message || 'Error'));
      }
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
    const gwConfig = error.response?.config as GatewayAxiosConfig | undefined;
    const rawData = error.response && error.response.data;
    let data: any = rawData;
    try {
      if (openEncrypt && rawData?.content && rawData?.iv && gwConfig?.gatewaySession) {
        data = openGatewayEnvelope(rawData, gwConfig.gatewaySession);
      }
    } catch {
      data = rawData;
    }
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
      errorMsg('请求超时，请稍后重试');
    } else {
      errorMsg('请求失败，请检查网络是否已连接');
    }
    return Promise.reject(requestError);
  },
);

export default request;
