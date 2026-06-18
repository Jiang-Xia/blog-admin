/** 系统物品 effectJson 按类型的字段说明（与 blog-server table.md 约定一致） */
export interface ItemEffectGuide {
  summary: string;
  fields: string[];
  example: Record<string, unknown>;
}

export const ITEM_EFFECT_GUIDES: Record<string, ItemEffectGuide> = {
  achievement: {
    summary: '成就定义专用。达成条件、经验奖励等也可在「成就管理」页维护。',
    fields: [
      'maxProgress：达成所需次数',
      'expReward：完成奖励经验',
      'badge.color：徽章颜色（HEX，如 #4ade80）',
      'trackEvent：可选，追踪事件类型',
      'revealName / revealDescription：隐藏成就揭示文案',
    ],
    example: { maxProgress: 1, expReward: 20, badge: { color: '#4ade80' } },
  },
  title: {
    summary: '称号装扮。展示名称用「名称」字段，扩展配置通常留空即可。',
    fields: ['color：可选，称号展示颜色（HEX）'],
    example: {},
  },
  avatar_frame: {
    summary: '头像框装扮。边框颜色写在扩展配置中。',
    fields: ['color：头像框边框颜色（HEX，如 #4ade80）'],
    example: { color: '#4ade80' },
  },
  pet: {
    summary: '宠物模板。用户兑换/孵化后在 rpg_user_pet 生成实例。',
    fields: [
      'baseHp：基础生命值',
      'baseAtk：基础攻击',
      'expBoost：出战经验加成（0.05 = +5%）',
      'currencyCost：钻石兑换价格',
      'evolveTarget：可选，进化目标 pet code',
    ],
    example: { baseHp: 100, baseAtk: 10, expBoost: 0.08, currencyCost: 120 },
  },
  consumable: {
    summary: '消耗品。使用后按 grantType 发放奖励，宠物蛋也走此类型。',
    fields: [
      'grantType：exp | ticket | buff | pet | item',
      'amount：经验/抽奖券数量（grantType=exp/ticket 时）',
      'buffCode：Buff 编码（grantType=buff 时，如 exp_boost_small）',
      'petCode：宠物模板编码（grantType=pet 时）',
    ],
    example: { grantType: 'pet', petCode: 'pet_slime' },
  },
  buff: {
    summary: 'Buff 物品模板。发放后写入用户 Buff 列表，exp_boost 类需用户手动激活。',
    fields: [
      'buffType：exp_boost | hp_regen | ban_reduction | shield | lucky',
      'value：效果数值（exp_boost 时 0.2 = +20%）',
      'durationMinutes：持续分钟数',
      'remainingUses：剩余次数，-1 表示不限',
    ],
    example: { buffType: 'exp_boost', value: 0.2, durationMinutes: 60, remainingUses: -1 },
  },
  currency: {
    summary: '钻石等物品。背包中 quantity 表示持有数量，扩展配置用于合成等玩法。',
    fields: ['composeTarget：合成目标物品 code', 'composeCount：合成所需数量'],
    example: { composeTarget: 'ticket_box', composeCount: 10 },
  },
  equipment: {
    summary: '装备类扩展字段，按具体玩法自定义。',
    fields: ['slot：装备槽位（如 weapon / armor）', 'stats：属性加成对象，如 { atk: 10, hp: 50 }'],
    example: { slot: 'weapon', stats: { atk: 10 } },
  },
};

export const DEFAULT_ITEM_EFFECT_GUIDE: ItemEffectGuide = {
  summary: '请先选择物品类型，下方会展示对应字段说明。',
  fields: [],
  example: {},
};

export function getItemEffectGuide(itemType?: string): ItemEffectGuide {
  if (!itemType) return DEFAULT_ITEM_EFFECT_GUIDE;
  return ITEM_EFFECT_GUIDES[itemType] || DEFAULT_ITEM_EFFECT_GUIDE;
}
