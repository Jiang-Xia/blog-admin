import request from '@/api/request';

// ========== 成就管理 ==========

/** 分页查询成就列表 */
export const getAchievementList = (params: Record<string, any>) => {
  return request({
    url: '/admin/rpg/achievements',
    method: 'get',
    params,
  });
};

/** 创建成就 */
export const createAchievement = (data: Record<string, any>) => {
  return request({
    url: '/admin/rpg/achievements',
    method: 'post',
    data,
  });
};

/** 更新成就 */
export const updateAchievement = (id: number, data: Record<string, any>) => {
  return request({
    url: `/admin/rpg/achievements/${id}`,
    method: 'patch',
    data,
  });
};

/** 删除成就 */
export const deleteAchievement = (id: number) => {
  return request({
    url: `/admin/rpg/achievements/${id}`,
    method: 'delete',
  });
};

// ========== 每日任务管理 ==========

/** 分页查询任务列表 */
export const getQuestList = (params: Record<string, any>) => {
  return request({
    url: '/admin/rpg/quests',
    method: 'get',
    params,
  });
};

/** 创建任务 */
export const createQuest = (data: Record<string, any>) => {
  return request({
    url: '/admin/rpg/quests',
    method: 'post',
    data,
  });
};

/** 更新任务 */
export const updateQuest = (id: number, data: Record<string, any>) => {
  return request({
    url: `/admin/rpg/quests/${id}`,
    method: 'patch',
    data,
  });
};

/** 删除任务 */
export const deleteQuest = (id: number) => {
  return request({
    url: `/admin/rpg/quests/${id}`,
    method: 'delete',
  });
};

// ========== 抽奖奖池管理 ==========

/** 分页查询奖池列表 */
export const getLotteryPoolList = (params: Record<string, any>) => {
  return request({
    url: '/admin/rpg/lottery/pool',
    method: 'get',
    params,
  });
};

/** 创建奖池物品 */
export const createLotteryPool = (data: Record<string, any>) => {
  return request({
    url: '/admin/rpg/lottery/pool',
    method: 'post',
    data,
  });
};

/** 更新奖池物品 */
export const updateLotteryPool = (id: number, data: Record<string, any>) => {
  return request({
    url: `/admin/rpg/lottery/pool/${id}`,
    method: 'patch',
    data,
  });
};

/** 删除奖池物品 */
export const deleteLotteryPool = (id: number) => {
  return request({
    url: `/admin/rpg/lottery/pool/${id}`,
    method: 'delete',
  });
};

/** 分页查询抽奖记录 */
export const getLotteryRecordList = (params: Record<string, any>) => {
  return request({
    url: '/admin/rpg/lottery/records',
    method: 'get',
    params,
  });
};

// ========== 用户 RPG 数据 ==========

/** 分页查询用户RPG数据 */
export const getUserRpgList = (params: Record<string, any>) => {
  return request({
    url: '/admin/rpg/users',
    method: 'get',
    params,
  });
};

/** 查看用户RPG详情 */
export const getUserRpgDetail = (uid: number) => {
  return request({
    url: `/admin/rpg/users/${uid}`,
    method: 'get',
  });
};

// ========== 统计概览 ==========

/** RPG统计概览 */
export const getRpgStats = () => {
  return request({
    url: '/admin/rpg/stats',
    method: 'get',
  });
};
