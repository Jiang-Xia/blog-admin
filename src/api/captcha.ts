/**
 * 行为验证码 API（滑动 / 点选 / 旋转）
 * 数据来源：Nest CaptchaModule `/captcha/behavior/*`
 * 选用哪种由登录页进页随机；底图为官方示例素材
 */
import request from '@/api/request';

export type BehaviorCaptchaType = 'slide' | 'click' | 'rotate';

export type BehaviorGetResult = {
  captchaId: string;
  type: BehaviorCaptchaType;
  image: string;
  thumb: string;
  thumbX?: number;
  thumbY?: number;
  thumbWidth?: number;
  thumbHeight?: number;
  /** 旋转：初始角（go-captcha-vue 拖动区间） */
  angle?: number;
  thumbSize?: number;
};

/** 拉取滑动 / 点选 / 旋转挑战图 */
export async function getBehaviorCaptcha(type: BehaviorCaptchaType) {
  const res = await request({
    url: '/captcha/behavior/get',
    method: 'post',
    data: { type },
    withCredentials: true,
  });
  return res.data as BehaviorGetResult;
}

/** 校验行为坐标/角度，成功返回二次校验 token */
export async function checkBehaviorCaptcha(payload: {
  captchaId: string;
  type: BehaviorCaptchaType;
  point?: { x: number; y: number };
  points?: Array<{ x: number; y: number }>;
  angle?: number;
}) {
  const res = await request({
    url: '/captcha/behavior/check',
    method: 'post',
    data: payload,
    withCredentials: true,
  });
  return res.data as { captchaVerification: string };
}
