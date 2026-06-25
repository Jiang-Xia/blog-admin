/** 每日任务 effectJson 字段说明（与 blog-server quest.service claimReward 一致） */
export interface QuestEffectGuide {
  summary: string;
  fields: string[];
  example: Record<string, unknown>;
}

export const QUEST_EFFECT_GUIDE: QuestEffectGuide = {
  summary: '领取任务奖励时的额外发放。经验/HP/钻石用上方独立字段，此处主要用于物品奖励。',
  fields: [
    'items：系统物品 code 数组，领取时调用 grantItems（如 ["title_lucky_cat"]）',
    '留空或 {} 表示无额外物品奖励',
  ],
  example: { items: ['title_lucky_cat'] },
};
