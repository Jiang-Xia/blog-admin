import request from '@/api/request';
type KeyValue = Record<string, unknown>;

export const getTagById = async (id: number) => {
  const res = await request({
    url: `/tag/${id}`,
    method: 'get',
  });
  return res.data;
};
export const getAllTag = async (params: KeyValue) => {
  const res = await request({
    url: '/tag',
    method: 'get',
    params,
  });
  return res.data;
};
export const createTag = async (data: KeyValue) => {
  const res = await request({
    url: '/tag',
    method: 'post',
    data,
  });
  return res.data;
};
export const updateTag = async (data: KeyValue) => {
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
