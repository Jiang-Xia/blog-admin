/*
 * @Author: 酱
 * @LastEditors: 酱
 * @Date: 2021-11-17 16:25:44
 * @LastEditTime: 2021-12-01 11:46:23
 * @Description:
 * @FilePath: \blog-home\src\api\user.ts
 */
import request from '@/utils/request'
export const registerUser = async (data: any) => {
  const res = await request({
    url: '/user/register',
    method: 'post',
    data
  })
  return res.data
}
export const userLogin = async (data: any) => {
  const res = await request({
    url: '/user/login',
    method: 'post',
    data
  })
  return res.data
}
