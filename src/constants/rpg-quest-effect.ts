/** 每日任务 effectJson 字段说明（与 blog-server quest.service claimReward 一致） */
export interface QuestEffectGuide {
  summary: string;
  fields: string[];
  example: Record<string, unknown>;
}

export const QUEST_EFFECT_GUIDE: QuestEffectGuide = {
  summary:
    '领取任务奖励时的额外发放。经验/HP/钻石/抽奖券用表单独立字段；物品奖励通过多选系统物品配置。',
  fields: [
    'ticketReward：抽奖券数量（写入 effectJson）',
    'items：系统物品 code 数组，领取时 grantItems（称号/头像框等）',
  ],
  example: { ticketReward: 1, items: ['lottery_frame_star'] },
};
