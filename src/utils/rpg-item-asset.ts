import { resolveStaticUrl } from '@/api/resources';

/** 与 blog-server rpg-item-asset.util ALLOWED_EXT 顺序一致 */
const RPG_ITEM_ASSET_EXTS = ['png', 'webp', 'jpg', 'jpeg', 'svg'] as const;

export type RpgItemAssetKind = 'itemIcon' | 'itemBg';

/** 探测图片 URL 是否可加载（用于管理端预览，避免硬编码扩展名导致裂图） */
function probeImageExists(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

/**
 * 按 icon 键探测已上传的物品资产 URL；无文件时返回空字符串
 * 与后端 resolveRpgItemAssetUrl 扩展名优先级一致
 */
export async function probeRpgItemAssetUrl(
  kind: RpgItemAssetKind,
  iconKey: string,
): Promise<string> {
  const key = iconKey?.trim();
  if (!key || key === 'default') return '';
  for (const ext of RPG_ITEM_ASSET_EXTS) {
    const url = resolveStaticUrl(`/static/rpgAssets/${kind}/${key}.${ext}`);
     
    if (await probeImageExists(url)) return url;
  }
  return '';
}

/** 将列表/详情中的 iconUrl、bgUrl 转为可预览的完整 URL */
export function resolveRpgItemAssetPreview(
  iconUrl?: string | null,
  bgUrl?: string | null,
): { iconPreview: string; bgPreview: string } {
  return {
    iconPreview: iconUrl ? resolveStaticUrl(iconUrl) : '',
    bgPreview: bgUrl ? resolveStaticUrl(bgUrl) : '',
  };
}
