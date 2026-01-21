import request from '@/api/request';
import type { RouteRecordNormalized } from 'vue-router';
import type { UserState } from '@/store/modules/user/types';

export interface MobileLoginData {
  username: string;
  password: string;
  authCode: string;
}

export interface EmailLoginData {
  email: string;
  password: string;
  verificationCode: string;
}

export type LoginData = MobileLoginData | EmailLoginData;

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
export async function getMenuList() {
  // mock
  // const res2 = await request.post<RouteRecordNormalized[]>('/api/user/menu');
  // console.log('res1', res1);
  // server
  const res2 = await request.get<RouteRecordNormalized[]>('/admin/menu');
  // console.log('res2', res2);
  return res2;
}

// 发送邮箱验证码
export function sendEmailCaptcha(email: string) {
  return request.post('/api/user/sendEmailCaptcha', { email });
}

// 管理员创建用户
export interface AdminCreateUserData {
  nickname: string;
  username?: string;
  mobile: string;
  email?: string;
  password: string;
  roleIds?: number[];
  deptId?: number;
  intro?: string;
  avatar?: string;
}

// 管理员更新用户（不包含手机号、用户名和密码字段，因为这些不可修改）
export interface AdminUpdateUserData {
  nickname: string;
  roleIds?: number[];
  deptId?: number;
  intro?: string;
  avatar?: string;
}

export function adminCreateUser(data: AdminCreateUserData) {
  return request.post('/user/admin/create', data);
}

// 管理员更新用户
export function adminUpdateUser(id: number, data: AdminUpdateUserData) {
  return request.post(`/user/admin/update/${id}`, data);
}
