import type { HttpResponse } from '@/api/request';

/** 校验业务 code，失败时抛出带 message 的 Error */
export function assertApiOk<T = unknown>(
  res: HttpResponse<T> | null | undefined,
  fallbackMsg = '请求失败',
): HttpResponse<T> {
  if (!res) {
    throw new Error(fallbackMsg);
  }
  if (res.code !== undefined && res.code !== 200) {
    throw new Error(res.message || fallbackMsg);
  }
  return res;
}

/** 从 axios / 业务 Error 中提取可读提示 */
export function getApiErrorMessage(err: unknown, fallback = '操作失败'): string {
  if (!err) return fallback;
  if (typeof err === 'string') return err;
  const e = err as { message?: string; status?: number };
  if (e.status === 409) {
    return e.message || '任务进行中，请稍后再试';
  }
  if (e.message) return e.message;
  return fallback;
}
