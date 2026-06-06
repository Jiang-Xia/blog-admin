import request from '@/api/request';

// ========== 敏感词 CRUD ==========

/** 分页查询敏感词列表 */
export const getSensitiveWordList = (params: Record<string, any>) => {
  return request({
    url: '/sensitive-word',
    method: 'get',
    params,
  });
};

/** 新增敏感词 */
export const createSensitiveWord = (data: { word: string; category?: string }) => {
  return request({
    url: '/sensitive-word',
    method: 'post',
    data,
  });
};

/** 批量新增敏感词 */
export const batchCreateSensitiveWords = (data: { word: string; category?: string }[]) => {
  return request({
    url: '/sensitive-word/batch',
    method: 'post',
    data,
  });
};

/** 编辑敏感词 */
export const updateSensitiveWord = (id: number, data: Record<string, any>) => {
  return request({
    url: `/sensitive-word/${id}`,
    method: 'patch',
    data,
  });
};

/** 删除敏感词 */
export const deleteSensitiveWord = (id: number) => {
  return request({
    url: `/sensitive-word/${id}`,
    method: 'delete',
  });
};

// ========== 命中记录与审核 ==========

/** 分页查询命中记录 */
export const getHitRecordList = (params: Record<string, any>) => {
  return request({
    url: '/sensitive-word/hit',
    method: 'get',
    params,
  });
};

/** 审核通过 */
export const approveHitRecord = (id: number) => {
  return request({
    url: `/sensitive-word/hit/${id}/approve`,
    method: 'post',
  });
};

/** 审核拒绝 */
export const rejectHitRecord = (id: number) => {
  return request({
    url: `/sensitive-word/hit/${id}/reject`,
    method: 'post',
  });
};
