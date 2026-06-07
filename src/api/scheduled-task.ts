import request from '@/api/request';

// ======================== 执行日志 ========================

/** 分页查询任务执行日志 */
export const getScheduledTaskList = (params: Record<string, any>) => {
  return request({
    url: '/scheduled-task',
    method: 'get',
    params,
  });
};

// ======================== 任务定义 CRUD ========================

/** 获取所有任务定义列表（含运行状态） */
export const getTaskList = () => {
  return request({
    url: '/scheduled-task/tasks',
    method: 'get',
  });
};

/** 分页获取任务定义列表（含运行状态） */
export const getAllTasks = (params?: Record<string, any>) => {
  return request({
    url: '/scheduled-task/tasks/all',
    method: 'get',
    params,
  });
};

/** 获取单个任务定义 */
export const getOneTask = (id: number) => {
  return request({
    url: `/scheduled-task/tasks/${id}`,
    method: 'get',
  });
};

/** 创建任务 */
export const createTask = (data: Record<string, any>) => {
  return request({
    url: '/scheduled-task/tasks',
    method: 'post',
    data,
  });
};

/** 更新任务 */
export const updateTask = (id: number, data: Record<string, any>) => {
  return request({
    url: `/scheduled-task/tasks/${id}`,
    method: 'patch',
    data,
  });
};

/** 删除任务 */
export const deleteTask = (id: number) => {
  return request({
    url: `/scheduled-task/tasks/${id}`,
    method: 'delete',
  });
};

// ======================== 运行控制 ========================

/** 获取指定任务运行状态 */
export const getTaskStatus = (taskName: string) => {
  return request({
    url: `/scheduled-task/status/${taskName}`,
    method: 'get',
  });
};

/** 手动触发指定任务 */
export const triggerTask = (taskName: string) => {
  return request({
    url: `/scheduled-task/trigger/${taskName}`,
    method: 'post',
  });
};

/** 停止指定定时任务 */
export const stopTask = (taskName: string) => {
  return request({
    url: `/scheduled-task/stop/${taskName}`,
    method: 'post',
  });
};

/** 启动指定定时任务 */
export const startTask = (taskName: string) => {
  return request({
    url: `/scheduled-task/start/${taskName}`,
    method: 'post',
  });
};

/** 切换指定任务的日志记录开关 */
export const toggleLogRecording = (taskName: string) => {
  return request({
    url: `/scheduled-task/log-recording/${taskName}`,
    method: 'patch',
  });
};
