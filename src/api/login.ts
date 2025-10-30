/*
 * @Author: 酱
 * @LastEditors: 酱
 * @Date: 2021-11-17 16:25:44
 * @LastEditTime: 2022-07-10 14:40:42
 * @Description:
 * @FilePath: \blog-admin\src\api\login.ts
 */
// import request from '@/utils/request';
import request from '@/api/request';

type KeyValue = Record<string, unknown>;

export const registerUser = async (data: KeyValue) => {
  const res = await request({
    url: '/user/register',
    method: 'post',
    data,
  });
  return res.data;
};

export const userLogin = async (data: KeyValue, type = 'email') => {
  const url = type === 'email' ? '/user/email/login' : '/user/login';
  const res = await request({
    url: url,
    method: 'post',
    data,
    withCredentials: true,
  });
  return res.data;
};

export const userInfo = async () => {
  const res = await request({
    url: '/user/info',
    method: 'get',
  });
  return res.data;
};

export const getAuthCode = async () => {
  const res = await request({
    url: '/user/authCode',
    method: 'get',
  });
  return res.data;
};

export const getEmailAuthCode = async (data: KeyValue) => {
  const res = await request({
    url: '/user/email/sendCode',
    method: 'post',
    data,
  });
  return res.data;
};
