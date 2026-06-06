import request from '@/api/request';

/** 分页查询操作日志 */
export const getOperationLogList = (params: Record<string, any>) => {
  return request({
    url: '/operation-log',
    method: 'get',
    params,
  });
};

/** 清空全部历史日志 */
export const cleanOperationLog = () => {
  return request({
    url: '/operation-log/clean',
    method: 'delete',
  });
};
