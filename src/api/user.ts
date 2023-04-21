import request from '@/api/request';
import type { RouteRecordNormalized } from 'vue-router';
import { UserState } from '@/store/modules/user/types';
/* eslint import/no-cycle: [2, { maxDepth: 1 }] */
// import { useUserStore } from '@/store';

export interface LoginData {
  username: string;
  password: string;
  authCode: string;
}

export interface LoginRes {
  token: string;
}
export function login(data: LoginData) {
  return request.post<LoginRes>('/api/user/login', data);
}

export function logout() {
  return request.post<LoginRes>('/api/user/logout');
}

export function getUserInfo() {
  return request.post<UserState>('/api/user/info');
}

// 获取菜单数据
export async function getMenuList(role: string) {
  // mock
  // const res2 = await request.post<RouteRecordNormalized[]>('/api/user/menu');
  // console.log('res1', res1);
  // server
  const res2 = await request.get<RouteRecordNormalized[]>('/admin/menu', {
    params: { role },
  });
  // console.log('res2', res2);
  return res2;
}
