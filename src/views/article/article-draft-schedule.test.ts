/**
 * 文章草稿/定时发布功能 - 前端单元测试
 * 测试提交参数构建逻辑和状态显示逻辑
 */
import { describe, expect, it } from 'vitest';

// ---- 提交参数构建逻辑 ----

/**
 * 模拟 edit.vue 中 handleFinish 构建提交参数的逻辑
 */
function buildSubmitParams(formState: {
  title: string;
  description: string;
  content: string;
  contentHtml: string;
  category: string;
  cover: string;
  tags: number[];
  status: string;
  scheduledPublishAt: string;
}) {
  return {
    title: formState.title,
    description: formState.description,
    content: formState.content,
    contentHtml: formState.contentHtml,
    category: formState.category,
    cover: formState.cover,
    tags: formState.tags,
    status: formState.status,
    scheduledPublishAt: formState.status === 'scheduled' ? formState.scheduledPublishAt : null,
  };
}

describe('文章提交参数构建', () => {
  const baseForm = {
    title: '测试文章',
    description: '测试描述',
    content: '# 内容',
    contentHtml: '<h1>内容</h1>',
    category: 'cat-1',
    cover: 'https://example.com/cover.jpg',
    tags: [1, 2],
    status: 'publish',
    scheduledPublishAt: '',
  };

  it('立即发布时，status 为 publish，scheduledPublishAt 为 null', () => {
    const params = buildSubmitParams({ ...baseForm, status: 'publish' });
    expect(params.status).toBe('publish');
    expect(params.scheduledPublishAt).toBeNull();
  });

  it('保存草稿时，status 为 draft，scheduledPublishAt 为 null', () => {
    const params = buildSubmitParams({ ...baseForm, status: 'draft' });
    expect(params.status).toBe('draft');
    expect(params.scheduledPublishAt).toBeNull();
  });

  it('定时发布时，status 为 scheduled，scheduledPublishAt 传入时间', () => {
    const scheduledTime = '2026-07-01 12:00:00';
    const params = buildSubmitParams({
      ...baseForm,
      status: 'scheduled',
      scheduledPublishAt: scheduledTime,
    });
    expect(params.status).toBe('scheduled');
    expect(params.scheduledPublishAt).toBe(scheduledTime);
  });

  it('即使定时发布模式设置了时间，切换回 publish 后 scheduledPublishAt 被清除', () => {
    const params = buildSubmitParams({
      ...baseForm,
      status: 'publish',
      scheduledPublishAt: '2026-07-01 12:00:00', // 残留值
    });
    expect(params.status).toBe('publish');
    expect(params.scheduledPublishAt).toBeNull();
  });

  it('即使定时发布模式设置了时间，切换回 draft 后 scheduledPublishAt 被清除', () => {
    const params = buildSubmitParams({
      ...baseForm,
      status: 'draft',
      scheduledPublishAt: '2026-07-01 12:00:00', // 残留值
    });
    expect(params.status).toBe('draft');
    expect(params.scheduledPublishAt).toBeNull();
  });
});

// ---- 状态显示逻辑 ----

/**
 * 模拟 list.vue 中状态列的显示映射
 */
function getStatusDisplay(status: string | undefined) {
  const statusMap: Record<string, { label: string; color: string }> = {
    publish: { label: '已发布', color: 'green' },
    draft: { label: '草稿', color: 'gray' },
    scheduled: { label: '定时发布', color: 'orangered' },
  };
  return statusMap[status || 'publish'] || { label: status || '', color: 'blue' };
}

describe('文章列表状态显示', () => {
  it('publish 状态显示为"已发布"绿色标签', () => {
    const display = getStatusDisplay('publish');
    expect(display.label).toBe('已发布');
    expect(display.color).toBe('green');
  });

  it('draft 状态显示为"草稿"灰色标签', () => {
    const display = getStatusDisplay('draft');
    expect(display.label).toBe('草稿');
    expect(display.color).toBe('gray');
  });

  it('scheduled 状态显示为"定时发布"橙红色标签', () => {
    const display = getStatusDisplay('scheduled');
    expect(display.label).toBe('定时发布');
    expect(display.color).toBe('orangered');
  });

  it('undefined 状态默认为 publish 显示', () => {
    const display = getStatusDisplay(undefined);
    expect(display.label).toBe('已发布');
    expect(display.color).toBe('green');
  });

  it('未知状态显示原始值和蓝色标签', () => {
    const display = getStatusDisplay('unknown');
    expect(display.label).toBe('unknown');
    expect(display.color).toBe('blue');
  });
});

// ---- 按钮文案逻辑 ----

/**
 * 模拟 edit.vue 中提交按钮文案的逻辑
 */
function getSubmitButtonText(status: string) {
  if (status === 'draft') return '保存草稿';
  if (status === 'scheduled') return '设置定时发布';
  return '发布';
}

describe('编辑页按钮文案', () => {
  it('publish 状态按钮显示"发布"', () => {
    expect(getSubmitButtonText('publish')).toBe('发布');
  });

  it('draft 状态按钮显示"保存草稿"', () => {
    expect(getSubmitButtonText('draft')).toBe('保存草稿');
  });

  it('scheduled 状态按钮显示"设置定时发布"', () => {
    expect(getSubmitButtonText('scheduled')).toBe('设置定时发布');
  });
});

// ---- 编辑回显逻辑 ----

/**
 * 模拟 edit.vue 中编辑模式回显 status 和 scheduledPublishAt 的逻辑
 */
function mapArticleToFormState(info: { status?: string; scheduledPublishAt?: string }) {
  return {
    status: info.status || 'publish',
    scheduledPublishAt: info.scheduledPublishAt || '',
  };
}

describe('编辑模式回显', () => {
  it('旧文章没有 status 字段时默认为 publish', () => {
    const state = mapArticleToFormState({});
    expect(state.status).toBe('publish');
    expect(state.scheduledPublishAt).toBe('');
  });

  it('草稿文章正确回显', () => {
    const state = mapArticleToFormState({ status: 'draft' });
    expect(state.status).toBe('draft');
  });

  it('定时发布文章回显 status 和 scheduledPublishAt', () => {
    const time = '2026-07-01T12:00:00.000Z';
    const state = mapArticleToFormState({
      status: 'scheduled',
      scheduledPublishAt: time,
    });
    expect(state.status).toBe('scheduled');
    expect(state.scheduledPublishAt).toBe(time);
  });
});
