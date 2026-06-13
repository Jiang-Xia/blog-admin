import request from '@/api/request';
type KeyValue = Record<string, unknown>;

export const getRoleById = async (id: number) => {
  const res = await request({
    url: `/role/${id}`,
    method: 'get',
  });
  return res;
};

export const getAllRole = async (params: KeyValue) => {
  const res = await request({
    url: '/role',
    method: 'get',
    params,
  });
  return res;
};

export const createRole = async (data: KeyValue) => {
  const res = await request({
    url: '/role',
    method: 'post',
    data,
  });
  return res;
};

export const updateRole = async (data: KeyValue) => {
  const res = await request({
    url: `/role/${data.editId}`,
    method: 'patch',
    data,
  });
  return res;
};

export const delRole = async (id: string) => {
  const res = await request({
    url: `/role/${id}`,
    method: 'delete',
  });
  return res;
};

export interface RoleDataScopeItem {
  resourceType: string;
  scopeType: 'ALL' | 'DEPT' | 'DEPT_AND_CHILDREN' | 'CUSTOM';
  deptIds?: number[];
}

export const getRoleDataScope = async (id: number) => {
  const res = await request({
    url: `/role/${id}/data-scope`,
    method: 'get',
  });
  return res;
};

export const updateRoleDataScope = async (id: number, dataScopes: RoleDataScopeItem[]) => {
  const res = await request({
    url: `/role/${id}/data-scope`,
    method: 'put',
    data: { dataScopes },
  });
  return res;
};
