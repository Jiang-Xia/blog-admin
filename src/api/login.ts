/*
 * @Author: 酱
 * @LastEditors: 酱
 * @Date: 2021-11-17 16:25:44
 * @LastEditTime: 2022-06-26 20:24:13
 * @Description:
 * @FilePath: \blog-admin\src\api\login.ts
 */
import request from '@/utils/request';

export const registerUser = async (data: any) => {
  const res = await request({
    url: '/user/register',
    method: 'post',
    data,
  });
  return res.data;
};
export const userLogin = async (data: any) => {
  const res = await request({
    url: '/user/login',
    method: 'post',
    data,
  });
  return res.data;
};
