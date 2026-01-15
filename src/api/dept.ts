import request from '@/api/request';
// 部门类型定义
export interface Dept {
  id?: number;
  deptName: string;
  deptCode: string;
  parentId: number;
  leaderId?: string;
  leaderName?: string;
  orderNum: number;
  status: number; // 1-正常 0-禁用
  remark?: string;
  parent?: Dept;
  children?: Dept[];
  createBy?: string;
  updateBy?: string;
  createTime?: string;
  updateTime?: string;
}

export interface DeptListVo {
  list: Dept[];
  pagination: {
    page: number;
    size: number;
    total: number;
  };
}

export interface DeptTreeVo {
  id: number;
  label: string;
  value: number;
  children?: DeptTreeVo[];
}

export interface DeptQueryParams {
  page?: number;
  size?: number;
  deptName?: string;
  status?: number;
  [key: string]: any;
}

// 部门管理API
export const getDeptById = async (id: number) => {
  const res = await request({
    url: `/dept/${id}`,
    method: 'get',
  });
  return res;
};

export const getAllDept = async (params: DeptQueryParams) => {
  const res = await request({
    url: '/dept',
    method: 'get',
    params,
  });
  return res;
};

export const createDept = async (data: Dept) => {
  const res = await request({
    url: '/dept',
    method: 'post',
    data,
  });
  return res;
};

export const updateDept = async (data: Dept) => {
  const res = await request({
    url: `/dept/${data.id}`,
    method: 'patch',
    data,
  });
  return res;
};

// 获取部门树形结构
export const getDeptTree = async () => {
  const res = await request({
    url: '/dept/tree',
    method: 'get',
  });
  return res;
};

// 获取部门下拉列表
export const getDeptOptions = async () => {
  const res = await request({
    url: '/dept/options',
    method: 'get',
  });
  return res;
};

// 检查部门编码是否已存在
export const checkDeptCode = async (deptCode: string, id?: number) => {
  const params = id ? { deptCode, id } : { deptCode };
  const res = await request({
    url: '/dept/checkCode',
    method: 'get',
    params,
  });
  return res;
};

export const delDept = async (id: string) => {
  const res = await request({
    url: `/dept/${id}`,
    method: 'delete',
  });
  return res;
};
