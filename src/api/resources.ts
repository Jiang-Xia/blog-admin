import request from '@/api/request';
import { staticUrl } from '@/config';

export type UploadCategory = 'avatar' | 'cover' | 'article';

export const resolveStaticUrl = (path = ''): string => {
  if (!path) return '';
  if (path.startsWith('http') || path.includes('base64')) return path;
  if (path.startsWith('/static')) {
    return `${staticUrl}${path}`;
  }
  return path;
};

export const uploadImage = (file: File, category: UploadCategory) => {
  const form = new FormData();
  form.append('fileContents', file);
  form.append('category', category);
  return request.post(`/resources/uploadFile?category=${category}`, form);
};

export const parseUploadedPath = (res: unknown): string => {
  if (!res) return '';
  if (Array.isArray(res)) {
    return (res[0] as { url?: string })?.url || '';
  }
  const wrapped = res as { data?: unknown; url?: string };
  if (Array.isArray(wrapped.data)) {
    return (wrapped.data[0] as { url?: string })?.url || '';
  }
  if (wrapped.data && typeof wrapped.data === 'object' && 'url' in (wrapped.data as object)) {
    return (wrapped.data as { url?: string }).url || '';
  }
  return wrapped.url || '';
};

/** 上传完成后写入表单：拼接域名后的完整 URL */
export const parseUploadedUrl = (res: unknown): string => {
  return resolveStaticUrl(parseUploadedPath(res));
};
