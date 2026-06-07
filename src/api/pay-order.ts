import request from '@/api/request';

/** 创建支付订单 */
export const createPayOrder = (data: Record<string, any>) => {
  return request({
    url: '/pay/order/create',
    method: 'post',
    data,
  });
};

/** 分页查询订单列表 */
export const getPayOrderList = (params: Record<string, any>) => {
  return request({
    url: '/pay/order/list',
    method: 'get',
    params,
  });
};

/** 退款 */
export const refundPayOrder = (data: Record<string, any>) => {
  return request({
    url: '/pay/order/refund',
    method: 'post',
    data,
  });
};

/** 关单 */
export const closePayOrder = (data: Record<string, any>) => {
  return request({
    url: '/pay/order/close',
    method: 'post',
    data,
  });
};

/** 主动查询订单状态 */
export const queryPayOrder = (params: Record<string, any>) => {
  return request({
    url: '/pay/order/query',
    method: 'get',
    params,
  });
};
