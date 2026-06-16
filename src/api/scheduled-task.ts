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

/** 清除权限相关 Redis 缓存（超级管理员） */
export const clearPermissionCache = () => {
  return request({
    url: '/scheduled-task/cache/clear-permissions',
    method: 'post',
  });
};

/** 刷新百度统计 access_token（超级管理员） */
export const refreshTongjiToken = () => {
  return request({
    url: '/scheduled-task/cache/refresh-tongji-token',
    method: 'post',
  });
};

// ======================== 数据库备份 ========================

/** 下载最新数据库备份（超级管理员） */
export const downloadDatabaseBackup = async () => {
  const axios = (await import('axios')).default;
  const { getToken } = await import('@/utils/auth');
  const { baseUrl } = await import('@/config');
  const token = getToken();
  try {
    const res = await axios.get(`${baseUrl}/scheduled-task/backups/download`, {
      responseType: 'blob',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const contentType = res.headers['content-type'] || '';
    if (contentType.includes('application/json')) {
      const text = await (res.data as Blob).text();
      const err = JSON.parse(text);
      throw new Error(err.message || '下载失败');
    }
    const disposition = res.headers['content-disposition'] || '';
    const match = disposition.match(/filename="?([^"]+)"?/);
    const fileName = match?.[1] || `myblog_backup_${Date.now()}.sql`;
    const blob = new Blob([res.data], { type: 'application/sql' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (e: any) {
    const blob = e?.response?.data;
    if (blob instanceof Blob && blob.type?.includes('application/json')) {
      const text = await blob.text();
      const err = JSON.parse(text);
      throw new Error(err.message || '下载失败');
    }
    throw e;
  }
};
