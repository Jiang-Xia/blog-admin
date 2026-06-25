import { getItemConfigList } from '@/api/rpg';

/** 成就/任务可发放的系统物品类型（与 inventory.grantItems 一致） */
export const GRANTABLE_ITEM_TYPES = [
  'title',
  'avatar_frame',
  'consumable',
  'buff',
  'pet',
  'equipment',
];

export interface GrantableItemOption {
  code: string;
  name: string;
  itemType: string;
  active?: boolean;
}

const ITEM_TYPE_LABELS: Record<string, string> = {
  title: '称号',
  avatar_frame: '头像框',
  consumable: '消耗品',
  buff: '增益',
  pet: '宠物',
  equipment: '装备',
};

export const grantableItemTypeLabel = (type: string) => ITEM_TYPE_LABELS[type] || type;

/** 加载可发放物品下拉选项 */
export async function loadGrantableItemOptions(): Promise<GrantableItemOption[]> {
  const res: any = await getItemConfigList({ page: 1, pageSize: 500 });
  const list: GrantableItemOption[] = res?.data?.list ?? [];
  return list.filter(
    (item) => GRANTABLE_ITEM_TYPES.includes(item.itemType) && item.active !== false,
  );
}

/** 表格展示物品 code 列表 */
export function formatItemCodes(items?: string[] | null): string {
  if (!items?.length) return '—';
  return items.join(', ');
}
