<template>
  <div class="container">
    <a-card class="general-card" title="每日任务管理">
      <a-row>
        <a-col :flex="1">
          <a-form
            :model="formModel"
            :label-col-props="{ span: 6 }"
            :wrapper-col-props="{ span: 18 }"
            label-align="left"
          >
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item label="关键词">
                  <a-input
                    v-model="formModel.keyword"
                    placeholder="请输入任务名称"
                    allow-clear
                    @press-enter="search"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="类型">
                  <a-select v-model="formModel.type" placeholder="请选择类型" allow-clear>
                    <a-option value="daily">每日</a-option>
                    <a-option value="weekly">每周</a-option>
                    <a-option value="special">一次性</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="状态">
                  <a-select v-model="formModel.active" allow-clear>
                    <a-option value="true">启用</a-option>
                    <a-option value="false">禁用</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-col>
        <a-col :span="5" style="text-align: right">
          <a-space :size="8">
            <a-button type="primary" @click="search">
              <template #icon><icon-search /></template>
              搜索
            </a-button>
            <a-button @click="reset">
              <template #icon><icon-refresh /></template>
              重置
            </a-button>
          </a-space>
        </a-col>
      </a-row>

      <a-divider style="margin-top: 0" />

      <a-row style="margin-bottom: 16px">
        <a-col :span="16">
          <a-space>
            <a-button type="primary" @click="showCreateModal">
              <template #icon><icon-plus /></template>
              新增任务
            </a-button>
          </a-space>
        </a-col>
      </a-row>

      <a-table
        :loading="loading"
        row-key="id"
        :pagination="false"
        :data="tableData"
        :bordered="false"
        scrollbar
        :scroll="{ x: 1380, y: 600 }"
      >
        <template #columns>
          <a-table-column title="编码" data-index="code" :width="140" />
          <a-table-column title="名称" data-index="name" :width="110" />
          <a-table-column title="描述" data-index="description" :width="160" ellipsis tooltip />
          <a-table-column title="类型" data-index="type" :width="80">
            <template #cell="{ record }">
              <a-tag
                :color="
                  record.type === 'special'
                    ? 'orangered'
                    : record.type === 'daily'
                      ? 'blue'
                      : 'purple'
                "
              >
                {{ questTypeLabel(record.type) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="目标行为" data-index="targetAction" :width="100">
            <template #cell="{ record }">
              {{ targetActionLabel(record.targetAction) }}
            </template>
          </a-table-column>
          <a-table-column title="目标次数" data-index="targetCount" :width="90" align="center" />
          <a-table-column title="经验奖励" data-index="expReward" :width="90" align="center">
            <template #cell="{ record }">
              <span style="color: #f59e0b; font-weight: 600">+{{ record.expReward }}</span>
            </template>
          </a-table-column>
          <a-table-column title="子类型" data-index="questSubtype" :width="80">
            <template #cell="{ record }">
              <a-tag>{{ questSubtypeLabel(record.questSubtype) }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="生命奖励" data-index="hpReward" :width="90" align="center" />
          <a-table-column title="钻石奖励" data-index="currencyReward" :width="90" align="center" />
          <a-table-column title="扩展配置" data-index="effectJson" :width="100" align="center">
            <template #cell="{ record }">
              <a-button
                v-if="record.effectJson && Object.keys(record.effectJson).length"
                size="mini"
                type="text"
                @click="showJsonDetail(record)"
              >
                查看
              </a-button>
              <span v-else>-</span>
            </template>
          </a-table-column>
          <a-table-column title="排序" data-index="sort" :width="60" align="center" />
          <a-table-column title="状态" data-index="active" :width="80">
            <template #cell="{ record }">
              <a-tag :color="record.active ? 'green' : 'red'">
                {{ record.active ? '启用' : '禁用' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="操作" data-index="operations" :width="120" fixed="right">
            <template #cell="{ record }">
              <a-space :size="8">
                <a-button size="mini" type="primary" @click="showEditModal(record)"
                  ><icon-edit
                /></a-button>
                <a-button size="mini" type="primary" status="danger" @click="handleDelete(record)"
                  ><icon-delete
                /></a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
      <TablePagination
        :total="pagination.total"
        :current="pagination.current"
        :page-size="pagination.pageSize"
        @change="onPageChange"
        @page-size-change="onPageSizeChange"
      />
    </a-card>

    <a-modal
      v-model:visible="modalVisible"
      :title="isEdit ? '编辑任务' : '新增任务'"
      :width="720"
      @before-ok="handleModalOk"
      @cancel="modalVisible = false"
    >
      <a-form
        :model="modalForm"
        :label-col-props="{ flex: '84px' }"
        :wrapper-col-props="{ flex: '1' }"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="编码" required>
              <a-input v-model="modalForm.code" placeholder="任务编码" :disabled="isEdit" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="名称" required>
              <a-input v-model="modalForm.name" placeholder="任务名称" allow-clear />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="描述">
              <a-input v-model="modalForm.description" placeholder="任务描述" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="类型">
              <a-select v-model="modalForm.type">
                <a-option value="daily">每日</a-option>
                <a-option value="weekly">每周</a-option>
                <a-option value="special">一次性</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="目标行为">
              <a-select v-model="modalForm.targetAction">
                <a-option value="sign_in">签到</a-option>
                <a-option value="comment">评论</a-option>
                <a-option value="reply">回复</a-option>
                <a-option value="article">发布文章</a-option>
                <a-option value="like">点赞</a-option>
                <a-option value="collect">收藏</a-option>
                <a-option value="msgboard">留言</a-option>
                <a-option value="tip">打赏</a-option>
                <a-option value="lottery_draw">抽奖</a-option>
                <a-option value="social_cheer">加油</a-option>
                <a-option value="social_flower">送花</a-option>
                <a-option value="social_egg">扔鸡蛋</a-option>
                <a-option value="guild_join">加入公会</a-option>
                <a-option value="pet_hatch">获得宠物</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="子类型">
              <a-select v-model="modalForm.questSubtype" @change="onQuestSubtypeChange">
                <a-option value="daily">每日</a-option>
                <a-option value="bounty">悬赏</a-option>
                <a-option value="weekly">周常</a-option>
                <a-option value="special">特殊</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="目标次数">
              <a-input-number
                v-model="modalForm.targetCount"
                :min="1"
                :precision="0"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="HP奖励">
              <a-input-number
                v-model="modalForm.hpReward"
                :min="0"
                :precision="0"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="经验奖励">
              <a-input-number
                v-model="modalForm.expReward"
                :min="0"
                :precision="0"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="钻石奖励">
              <a-input-number
                v-model="modalForm.currencyReward"
                :min="0"
                :precision="0"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="排序">
              <a-input-number
                v-model="modalForm.sort"
                :min="0"
                :precision="0"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="状态">
              <a-radio-group v-model="modalForm.active">
                <a-radio :value="true">启用</a-radio>
                <a-radio :value="false">禁用</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="扩展配置" class="effect-form-item">
              <div class="effect-guide">
                <div class="effect-guide__summary">{{ questEffectGuide.summary }}</div>
                <ul v-if="questEffectGuide.fields.length" class="effect-guide__fields">
                  <li v-for="field in questEffectGuide.fields" :key="field">{{ field }}</li>
                </ul>
                <a-button size="mini" type="outline" @click="fillEffectTemplate"
                  >填入示例模板</a-button
                >
              </div>
              <a-textarea
                v-model="modalForm.effectJsonText"
                :placeholder="effectJsonPlaceholder"
                :auto-size="{ minRows: 4, maxRows: 10 }"
                allow-clear
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="jsonVisible" title="扩展配置" :width="640" :footer="false">
      <pre class="json-preview">{{ jsonPreviewText }}</pre>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  /**
   * 每日任务管理：CRUD，扩展配置 JSON 编辑方式与系统物品管理一致
   */
  import { ref, reactive, computed } from 'vue';
  import type { Pagination } from '@/types/global';
  import { Message, Modal } from '@arco-design/web-vue';
  import {
    IconEdit,
    IconDelete,
    IconPlus,
    IconSearch,
    IconRefresh,
  } from '@arco-design/web-vue/es/icon';
  import { getQuestList, createQuest, updateQuest, deleteQuest } from '@/api/rpg';
  import useLoading from '@/hooks/loading';
  import { QUEST_EFFECT_GUIDE } from '@/constants/rpg-quest-effect';

  const QUEST_TYPE_LABELS: Record<string, string> = {
    daily: '每日',
    weekly: '每周',
    special: '一次性',
  };
  const QUEST_SUBTYPE_LABELS: Record<string, string> = {
    daily: '每日',
    bounty: '悬赏',
    weekly: '周常',
    special: '特殊',
  };
  const TARGET_ACTION_LABELS: Record<string, string> = {
    sign_in: '签到',
    comment: '评论',
    reply: '回复',
    article: '发布文章',
    like: '点赞',
    collect: '收藏',
    msgboard: '留言',
    tip: '打赏',
    lottery_draw: '抽奖',
    social_cheer: '加油',
    social_flower: '送花',
    social_egg: '扔鸡蛋',
    guild_join: '加入公会',
    pet_hatch: '获得宠物',
  };

  const questTypeLabel = (type: string) => QUEST_TYPE_LABELS[type] || type;
  const questSubtypeLabel = (subtype: string) => QUEST_SUBTYPE_LABELS[subtype] || subtype;
  const targetActionLabel = (action: string) => TARGET_ACTION_LABELS[action] || action;

  const questEffectGuide = QUEST_EFFECT_GUIDE;
  const effectJsonPlaceholder = computed(() => {
    const example = JSON.stringify(questEffectGuide.example, null, 2);
    return example === '{}' ? 'JSON 对象，通常可留空 {}' : example;
  });

  const { loading, setLoading } = useLoading(true);

  const generateFormModel = () => ({
    keyword: '',
    type: undefined as string | undefined,
    active: undefined as string | undefined,
    page: 1,
    pageSize: 20,
  });

  const formModel = ref(generateFormModel());
  const tableData = ref<any[]>([]);
  const basePagination: Pagination = { current: 1, pageSize: 20, total: 0 };
  const pagination = reactive({ ...basePagination });

  const modalVisible = ref(false);
  const isEdit = ref(false);
  const editId = ref<number>(0);
  const jsonVisible = ref(false);
  const jsonPreviewText = ref('');

  const defaultModalForm = {
    code: '',
    name: '',
    description: '',
    type: 'daily',
    questSubtype: 'daily',
    targetAction: 'sign_in',
    targetCount: 1,
    expReward: 10,
    hpReward: 0,
    currencyReward: 0,
    sort: 10,
    active: true,
    effectJsonText: '{}',
  };
  const modalForm = ref({ ...defaultModalForm });

  const isEffectJsonEmpty = (text?: string) => {
    const trimmed = text?.trim();
    if (!trimmed) return true;
    try {
      const parsed = JSON.parse(trimmed);
      return (
        parsed !== null &&
        typeof parsed === 'object' &&
        !Array.isArray(parsed) &&
        Object.keys(parsed).length === 0
      );
    } catch {
      return false;
    }
  };

  const fillEffectTemplate = () => {
    if (!isEffectJsonEmpty(modalForm.value.effectJsonText)) {
      Message.warning('当前已有内容，请先清空后再填入模板');
      return;
    }
    modalForm.value.effectJsonText = JSON.stringify(questEffectGuide.example, null, 2);
  };

  const showJsonDetail = (record: any) => {
    jsonPreviewText.value = JSON.stringify(record.effectJson || {}, null, 2);
    jsonVisible.value = true;
  };

  /** 子类型为 special/weekly 时同步 type，避免进度日期键不一致 */
  const onQuestSubtypeChange = (subtype: string) => {
    if (subtype === 'special') {
      modalForm.value.type = 'special';
    } else if (subtype === 'weekly') {
      modalForm.value.type = 'weekly';
    } else if (modalForm.value.type === 'special' || modalForm.value.type === 'weekly') {
      modalForm.value.type = 'daily';
    }
  };

  const buildPayload = () => {
    const text = modalForm.value.effectJsonText?.trim();
    let effectJson: Record<string, any> | null = null;
    if (text) {
      try {
        const parsed = JSON.parse(text);
        if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
          Message.warning('扩展配置必须是 JSON 对象');
          return null;
        }
        effectJson = parsed;
      } catch {
        Message.warning('扩展配置 JSON 格式不正确');
        return null;
      }
    }

    const targetCount = modalForm.value.targetCount ?? 1;
    if (targetCount < 1) {
      Message.warning('目标次数至少为 1');
      return null;
    }

    return {
      name: modalForm.value.name,
      description: modalForm.value.description || '',
      type: modalForm.value.type,
      questSubtype: modalForm.value.questSubtype,
      targetAction: modalForm.value.targetAction,
      targetCount,
      expReward: modalForm.value.expReward ?? 0,
      hpReward: modalForm.value.hpReward ?? 0,
      currencyReward: modalForm.value.currencyReward ?? 0,
      sort: modalForm.value.sort ?? 10,
      active: modalForm.value.active,
      effectJson,
    };
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res: any = await getQuestList(formModel.value);
      tableData.value = res.data.list;
      pagination.total = res.data.pagination.total;
    } finally {
      setLoading(false);
    }
  };

  loadData();

  const search = () => {
    formModel.value.page = 1;
    pagination.current = 1;
    loadData();
  };

  const reset = () => {
    formModel.value = generateFormModel();
    pagination.current = 1;
    loadData();
  };

  const onPageChange = (current: number) => {
    formModel.value.page = current;
    pagination.current = current;
    loadData();
  };

  const onPageSizeChange = (pageSize: number) => {
    formModel.value.page = 1;
    formModel.value.pageSize = pageSize;
    pagination.current = 1;
    pagination.pageSize = pageSize;
    loadData();
  };

  const showCreateModal = () => {
    isEdit.value = false;
    editId.value = 0;
    modalForm.value = { ...defaultModalForm };
    modalVisible.value = true;
  };

  const showEditModal = (record: any) => {
    isEdit.value = true;
    editId.value = record.id;
    modalForm.value = {
      code: record.code,
      name: record.name,
      description: record.description || '',
      type: record.type,
      questSubtype: record.questSubtype || 'daily',
      targetAction: record.targetAction,
      targetCount: record.targetCount ?? 1,
      expReward: record.expReward ?? 0,
      hpReward: record.hpReward ?? 0,
      currencyReward: record.currencyReward ?? 0,
      sort: record.sort ?? 10,
      active: record.active !== false,
      effectJsonText: JSON.stringify(record.effectJson || {}, null, 2),
    };
    modalVisible.value = true;
  };

  const handleModalOk = async () => {
    if (!modalForm.value.code || !modalForm.value.name) {
      Message.warning('编码和名称不能为空');
      return false;
    }
    const payload = buildPayload();
    if (!payload) return false;
    try {
      if (isEdit.value) {
        await updateQuest(editId.value, payload);
        Message.success('更新成功');
      } else {
        await createQuest({ code: modalForm.value.code, ...payload });
        Message.success('新增成功');
      }
      loadData();
      return true;
    } catch {
      return false;
    }
  };

  const handleDelete = (record: any) => {
    Modal.confirm({
      title: '删除任务',
      content: '确定删除该任务吗？删除后不可恢复。',
      onOk: async () => {
        await deleteQuest(record.id);
        Message.success('删除成功');
        loadData();
      },
    });
  };
</script>

<script lang="ts">
  export default { name: 'RpgQuestTable' };
</script>

<style scoped lang="less">
  .container {
    padding: 20px;
  }
  :deep(.arco-table-th) {
    &:last-child {
      .arco-table-th-item-title {
        margin-left: 16px;
      }
    }
  }
  .arco-card-body {
    min-height: 30vh;
  }
  .json-preview {
    max-height: 480px;
    overflow: auto;
    margin: 0;
    padding: 12px;
    background: var(--color-fill-2);
    border-radius: 4px;
    white-space: pre-wrap;
    word-break: break-all;
    font-size: 12px;
  }
  .effect-form-item {
    :deep(.arco-form-item-label-col) {
      align-self: flex-start;
      padding-top: 6px;
    }
    :deep(.arco-form-item-content) {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
    }
    .effect-guide,
    :deep(.arco-textarea-wrapper) {
      width: 100%;
    }
  }
  .effect-guide {
    padding: 10px 12px;
    background: var(--color-fill-2);
    border-radius: 4px;
    font-size: 12px;
    color: var(--color-text-2);
  }
  .effect-guide__summary {
    margin-bottom: 6px;
    color: var(--color-text-1);
  }
  .effect-guide__fields {
    margin: 0 0 8px;
    padding-left: 18px;
    line-height: 1.6;
  }
</style>
