import axios from 'axios';
import type { RouteRecordNormalized } from 'vue-router';
import { UserState } from '@/store/modules/user/types';
/* eslint import/no-cycle: [2, { maxDepth: 1 }] */
// import { useUserStore } from '@/store';

export interface LoginData {
  username: string;
  password: string;
}

export interface LoginRes {
  token: string;
}
export function login(data: LoginData) {
  return axios.post<LoginRes>('/api/user/login', data);
}

export function logout() {
  return axios.post<LoginRes>('/api/user/logout');
}

export function getUserInfo() {
  return axios.post<UserState>('/api/user/info');
}

// 获取菜单数据
export async function getMenuList(role: string) {
  // mock
  // const res2 = await axios.post<RouteRecordNormalized[]>('/api/user/menu');
  // console.log('res1', res1);
  // server
  const res2 = await axios.get<RouteRecordNormalized[]>('/admin/menu', {
    params: { role },
  });
  // console.log('res2', res2);
  return res2;
}
