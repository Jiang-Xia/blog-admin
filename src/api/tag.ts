import request from '@/api/request';

export const getTagById = async (id: number) => {
  const res = await request({
    url: `/tag/${id}`,
    method: 'get',
  });
  return res.data;
};
export const getAllTag = async (params: any) => {
  const res = await request({
    url: '/tag',
    method: 'get',
    params,
  });
  return res.data;
};
export const createTag = async (data: any) => {
  const res = await request({
    url: '/tag',
    method: 'post',
    data,
  });
  return res.data;
};
export const updateTag = async (data: any) => {
  const res = await request({
    url: '/tag',
    method: 'patch',
    data,
  });
  return res.data;
};
export const delTag = async (id: string) => {
  const res = await request({
    url: `/tag/${id}`,
    method: 'delete',
  });
  return res.data;
};
