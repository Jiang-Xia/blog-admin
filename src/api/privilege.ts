import request from '@/api/request';
type KeyValue = Record<string, unknown>;

export const getPrivilegeById = async (id: number) => {
  const res = await request({
    url: `/privilege/${id}`,
    method: 'get',
  });
  return res;
};

export const getAllPrivilege = async (params: KeyValue) => {
  const res = await request({
    url: '/privilege',
    method: 'get',
    params,
  });
  return res;
};

export const createPrivilege = async (data: KeyValue) => {
  const res = await request({
    url: '/privilege',
    method: 'post',
    data,
  });
  return res;
};

export const updatePrivilege = async (data: KeyValue) => {
  const res = await request({
    url: `/privilege/${data.id}`,
    method: 'patch',
    data,
  });
  return res;
};

export const delPrivilege = async (id: string) => {
  const res = await request({
    url: `/privilege/${id}`,
    method: 'delete',
  });
  return res;
};
