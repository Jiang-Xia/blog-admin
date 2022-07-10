/*
 * @Author: 酱
 * @LastEditors: 酱
 * @Date: 2021-11-17 16:26:53
 * @LastEditTime: 2022-07-10 18:18:37
 * @Description:
 * @FilePath: \blog-admin\src\utils\request.ts
 */
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
// import router from '@/router/'
// import { useStore } from '@/store';
import { Message } from '@arco-design/web-vue';
// import { getCode } from '@/utils/common'
// import showXiaLogin from '@/components/xia-login/main'
import { baseUrl } from '@/config';
import { getToken } from './auth';

interface MessageConfig {
  message: string;
  duration?: number;
  type?: string;
}
function errorMsg(msg: string) {
  Message.error(msg);
}
const $axios = axios.create({
  timeout: 4290000,
  baseURL: '',
});
$axios.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // openLoading()
    const token = getToken();
    config.headers = {};
    if (token) {
      // 请求头部添加token
      config.headers.Authorization = `Bearer ${token}`;
      console.log('token: ', config.headers.Authorization);
    }
    // const token = getToken()
    config.headers = {};
    config.baseURL = baseUrl;
    // if (config.method === 'get') {
    //   // 解决get请求axios不能设置Content-Type
    //   config.data = true
    // }
    // config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    if (token) {
      // 请求头部添加token
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
/**
 * 响应拦截器
 * 用于处理loading状态关闭、请求成功回调、响应错误处理
 */
$axios.interceptors.response.use(
  (response: AxiosResponse) => {
    // console.log(response.data)
    const { status } = response; // http自带状态码
    const { code } = response.data; // 自定义状态码
    if ((status >= 200 && status < 300) || status === 304) {
      // const pollingStatus = response.data.data.status
      if (code === 200) {
        // 全部json数据
        return Promise.resolve(response.data);
      }
      errorMsg(response.data.message as string);
      return Promise.reject(new Error(response.data || 'Error'));
    }
    return Promise.reject(response);
  },
  (error) => {
    console.log('error: ', error.response);
    if (error.response) {
      const data = error.response && error.response.data;
      switch (error.response.status) {
        case 401:
          errorMsg(data.message || '权限不足');
          // removeToken();
          // removeInfo();
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
export default $axios;
