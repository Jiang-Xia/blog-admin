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

// 开发态是否打印 HTTP 请求/响应（加密时打明文/解密 body，Network 仅见信封）
const openRequestLog = import.meta.env.DEV;

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

/**
 * 将 body 收成可打印摘要：FormData 不可序列化，仅标记类型
 */
const summarizeBodyForLog = (body: unknown): unknown => {
  if (body === undefined || body === null) {
    return undefined;
  }
  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    return '[FormData]';
  }
  return body;
};

/** DevTools 彩色徽章样式（加密请求紫底，普通蓝底，错误红底） */
const LOG_BADGE_ENCRYPT =
  'background:#7c3aed;color:#fff;padding:2px 8px;border-radius:4px;font-weight:700;';
const LOG_BADGE_HTTP =
  'background:#2563eb;color:#fff;padding:2px 8px;border-radius:4px;font-weight:700;';
const LOG_BADGE_ERR =
  'background:#dc2626;color:#fff;padding:2px 8px;border-radius:4px;font-weight:700;';
const LOG_PHASE = 'font-weight:700;margin-left:6px;';
const LOG_RESET = 'color:inherit;font-weight:400;';

/**
 * 开发态 HTTP 日志：彩色徽章 + method/url；加密时附带明文/解密 body
 * （加密后 Network 面板只有信封，控制台需看业务明文）
 */
const logHttp = (
  phase: 'req' | 'res' | 'err',
  info: {
    method: string;
    url: string;
    encrypted: boolean;
    status?: number;
    /** 请求明文 body/params，或解密后的响应体 */
    payload?: unknown;
  },
) => {
  if (!openRequestLog) {
    return;
  }
  const method = (info.method || 'GET').toUpperCase();
  const payload = summarizeBodyForLog(info.payload);
  const isErr = phase === 'err';
  const badgeStyle = isErr ? LOG_BADGE_ERR : info.encrypted ? LOG_BADGE_ENCRYPT : LOG_BADGE_HTTP;
  const badgeText = info.encrypted ? 'ENCRYPT' : 'HTTP';
  let phaseText: string;
  let phaseColor: string;
  if (phase === 'req') {
    phaseText = '↑ REQ';
    phaseColor = info.encrypted ? '#7c3aed' : '#2563eb';
  } else if (phase === 'res') {
    phaseText = `↓ RES ${info.status ?? '?'}`;
    phaseColor = '#16a34a';
  } else {
    phaseText = `✕ ERR ${info.status ?? ''}`.trim();
    phaseColor = '#dc2626';
  }

  console.log(
    `%c${badgeText}%c ${phaseText} %c${method} ${info.url}`,
    badgeStyle,
    `${LOG_PHASE}color:${phaseColor};`,
    LOG_RESET,
  );

  if (payload === undefined) {
    return;
  }
  // 加密场景标明「明文/解密」，避免和 Network 里的信封混淆
  const bodyLabel = info.encrypted ? (phase === 'req' ? '  明文 body' : '  解密 body') : '  body';
  console.log(bodyLabel, payload);
};

/** 解析 axios config 的 method / 相对 url，供日志展示 */
const resolveLogUrl = (config: InternalAxiosRequestConfig): { method: string; url: string } => {
  const method = String(config.method || 'get');
  const url = `${config.baseURL || ''}${config.url || ''}`;
  return { method, url };
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
    const { method, url } = resolveLogUrl(config);
    // 加密前明文：有 body 用 data，否则用 params（加密后 Network 只见信封）
    const plainOutbound =
      config.data !== undefined && config.data !== null
        ? config.data
        : config.params && Object.keys(config.params).length
          ? config.params
          : undefined;

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

    logHttp('req', {
      method,
      url,
      encrypted: openEncrypt,
      payload: openEncrypt || plainOutbound !== undefined ? plainOutbound : undefined,
    });
    return config;
  },
  (error) => Promise.reject(error),
);

request.interceptors.response.use(
  (response: AxiosResponse) => {
    const gwConfig = response.config as GatewayAxiosConfig;
    const { method, url } = resolveLogUrl(response.config);
    let res: any = response.data;
    if (openEncrypt && res?.content && res?.iv && gwConfig.gatewaySession) {
      res = openGatewayEnvelope(res, gwConfig.gatewaySession);
    }
    const { status } = response;
    logHttp('res', {
      method,
      url,
      encrypted: openEncrypt,
      status,
      // 加密时必须打解密后明文；未加密时同样打印便于联调
      payload: res,
    });
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
    const cfg = (error.response?.config || error.config) as InternalAxiosRequestConfig | undefined;
    if (cfg) {
      const { method, url } = resolveLogUrl(cfg);
      logHttp('err', {
        method,
        url,
        encrypted: openEncrypt,
        status: error.response?.status,
        payload: data ?? error.message,
      });
    } else {
      console.error('error: ', error);
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
