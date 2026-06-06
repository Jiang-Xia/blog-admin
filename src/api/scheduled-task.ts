import request from '@/api/request';

/** 分页查询任务执行日志 */
export const getScheduledTaskList = (params: Record<string, any>) => {
  return request({
    url: '/scheduled-task',
    method: 'get',
    params,
  });
};
