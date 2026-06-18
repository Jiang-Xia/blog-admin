import request from '@/api/request';
import { staticUrl } from '@/config';
import { compressImageFile } from '@/utils/image-compress';
import {
  isSameAvatarContent,
  isSameCoverContent,
  toStaticPath,
  computeFileSha256,
} from '@/utils/file-hash';
import { Message } from '@arco-design/web-vue';

export type UploadMediaCategory = 'avatar' | 'cover' | 'article';

export const resolveStaticUrl = (path = ''): string => {
  if (!path) return '';
  if (path.startsWith('http') || path.includes('base64')) return path;
  if (path.startsWith('/static')) {
    return `${staticUrl}${path}`;
  }
  return path;
};

const postUploadMedia = async (file: File, category: UploadMediaCategory) => {
  const contentHash = await computeFileSha256(file);
  const compressed = await compressImageFile(file, category);
  const form = new FormData();
  form.append('fileContents', compressed);
  form.append('contentHash', contentHash);
  form.append('category', category);
  return request.post(`/resources/upload-media?category=${category}`, form);
};

/** 修改头像（需登录） */
export const uploadAvatar = async (file: File, currentAvatarUrl?: string) => {
  if (currentAvatarUrl && (await isSameAvatarContent(file, currentAvatarUrl))) {
    Message.info('头像未变更');
    return [{ url: toStaticPath(currentAvatarUrl) }];
  }
  return postUploadMedia(file, 'avatar');
};

/** 文章封面上传（需登录） */
export const uploadCover = async (file: File, currentCoverUrl?: string) => {
  if (currentCoverUrl && (await isSameCoverContent(file, currentCoverUrl))) {
    Message.info('封面未变更');
    return [{ url: toStaticPath(currentCoverUrl) }];
  }
  return postUploadMedia(file, 'cover');
};

/** 文章正文图片上传（需登录） */
export const uploadArticleImage = (file: File) => postUploadMedia(file, 'article');

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
