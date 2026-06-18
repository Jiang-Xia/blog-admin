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

// ========== 系统物品管理 ==========

export const getItemConfigList = (params: Record<string, any>) => {
  return request({ url: '/admin/rpg/items', method: 'get', params });
};

export const createItemConfig = (data: Record<string, any>) => {
  return request({ url: '/admin/rpg/items', method: 'post', data });
};

export const updateItemConfig = (id: number, data: Record<string, any>) => {
  return request({ url: `/admin/rpg/items/${id}`, method: 'patch', data });
};

export const deleteItemConfig = (id: number) => {
  return request({ url: `/admin/rpg/items/${id}`, method: 'delete' });
};

// ========== 活动/赛季管理 ==========

export const getActivityList = (params: Record<string, any>) => {
  return request({ url: '/admin/rpg/activities', method: 'get', params });
};

export const createActivity = (data: Record<string, any>) => {
  return request({ url: '/admin/rpg/activities', method: 'post', data });
};

export const updateActivity = (id: number, data: Record<string, any>) => {
  return request({ url: `/admin/rpg/activities/${id}`, method: 'patch', data });
};

export const deleteActivity = (id: number) => {
  return request({ url: `/admin/rpg/activities/${id}`, method: 'delete' });
};

// ========== 公会管理 ==========

export const getGuildList = (params: Record<string, any>) => {
  return request({ url: '/admin/rpg/guilds', method: 'get', params });
};

export const deleteGuild = (id: number) => {
  return request({ url: `/admin/rpg/guilds/${id}`, method: 'delete' });
};

export const getGuildMembers = (id: number) => {
  return request({ url: `/admin/rpg/guilds/${id}/members`, method: 'get' });
};

export const removeGuildMember = (guildId: number, uid: number) => {
  return request({ url: `/admin/rpg/guilds/${guildId}/members/${uid}`, method: 'delete' });
};

// ========== 打赏/社交流水 ==========

export const getTipLogList = (params: Record<string, any>) => {
  return request({ url: '/admin/rpg/tips', method: 'get', params });
};

export const getSocialLogList = (params: Record<string, any>) => {
  return request({ url: '/admin/rpg/social-logs', method: 'get', params });
};

/** 超管充值钻石 */
export const rechargeDiamonds = (uid: number, data: { amount: number; reason?: string }) => {
  return request({
    url: `/admin/rpg/users/${uid}/currency`,
    method: 'post',
    data,
  });
};
