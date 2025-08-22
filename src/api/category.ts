// import request from 'axios';
import request from '@/api/request';

export const getCategoryById = async (id: number) => {
  const res = await request({
    url: `/category/${id}`,
    method: 'get',
  });
  return res.data;
};
type KeyValue = Record<string, unknown>;
export const getAllCategory = async (params?: KeyValue) => {
  const res = await request({
    url: '/category',
    method: 'get',
    params,
  });
  return res.data;
};
export const createCategory = async (data: KeyValue) => {
  const res = await request({
    url: '/category',
    method: 'post',
    data,
  });
  return res.data;
};
export const updateCategory = async (data: KeyValue) => {
  const res = await request({
    url: '/category',
    method: 'patch',
    data,
  });
  return res.data;
};
export const delCategory = async (id: string) => {
  const res = await request({
    url: `/category/${id}`,
    method: 'delete',
  });
  return res.data;
};
