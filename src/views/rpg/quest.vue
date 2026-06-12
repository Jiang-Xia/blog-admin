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
                    @press-enter="search"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="类型">
                  <a-select v-model="formModel.type" placeholder="请选择类型" allow-clear>
                    <a-option value="daily">每日</a-option>
                    <a-option value="weekly">每周</a-option>
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
        :pagination="pagination"
        :data="tableData"
        :bordered="false"
        @page-change="onPageChange"
      >
        <template #columns>
          <a-table-column title="编码" data-index="code" :width="140" />
          <a-table-column title="名称" data-index="name" :width="110" />
          <a-table-column title="描述" data-index="description" ellipsis tooltip />
          <a-table-column title="类型" data-index="type" :width="80">
            <template #cell="{ record }">
              <a-tag :color="record.type === 'daily' ? 'blue' : 'purple'">
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
          <a-table-column title="生命奖励" data-index="hpReward" :width="80" align="center" />
          <a-table-column title="排序" data-index="sort" :width="60" align="center" />
          <a-table-column title="状态" data-index="active" :width="80">
            <template #cell="{ record }">
              <a-tag :color="record.active ? 'green' : 'red'">
                {{ record.active ? '启用' : '禁用' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="操作" data-index="operations" :width="120">
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
    </a-card>

    <a-modal
      v-model:visible="modalVisible"
      :title="isEdit ? '编辑任务' : '新增任务'"
      :width="720"
      @ok="handleModalOk"
      @cancel="modalVisible = false"
    >
      <a-form :model="modalForm" :label-col-props="{ span: 7 }" :wrapper-col-props="{ span: 17 }">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="编码" required>
              <a-input v-model="modalForm.code" placeholder="任务编码" :disabled="isEdit" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="名称" required>
              <a-input v-model="modalForm.name" placeholder="任务名称" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="描述">
              <a-input v-model="modalForm.description" placeholder="任务描述" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="类型">
              <a-select v-model="modalForm.type">
                <a-option value="daily">每日</a-option>
                <a-option value="weekly">每周</a-option>
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
                <a-option value="article">发布文章</a-option>
                <a-option value="like">点赞</a-option>
                <a-option value="collect">收藏</a-option>
                <a-option value="msgboard">留言</a-option>
                <a-option value="tip">打赏</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="子类型">
              <a-select v-model="modalForm.questSubtype">
                <a-option value="daily">daily</a-option>
                <a-option value="bounty">bounty</a-option>
                <a-option value="special">special</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="目标次数">
              <a-input-number v-model="modalForm.targetCount" :min="1" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="HP奖励">
              <a-input-number v-model="modalForm.hpReward" :min="0" :max="100" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="经验奖励">
              <a-input-number v-model="modalForm.expReward" :min="0" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="排序">
              <a-input-number v-model="modalForm.sort" :min="0" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="状态">
              <a-radio-group v-model="modalForm.active">
                <a-radio :value="true">启用</a-radio>
                <a-radio :value="false">禁用</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive } from 'vue';
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

  const QUEST_TYPE_LABELS: Record<string, string> = {
    daily: '每日',
    weekly: '每周',
  };
  const QUEST_SUBTYPE_LABELS: Record<string, string> = {
    daily: '每日',
    bounty: '悬赏',
    special: '特殊',
  };
  const TARGET_ACTION_LABELS: Record<string, string> = {
    sign_in: '签到',
    comment: '评论',
    article: '发布文章',
    like: '点赞',
    collect: '收藏',
    msgboard: '留言',
    tip: '打赏',
  };

  const questTypeLabel = (type: string) => QUEST_TYPE_LABELS[type] || type;
  const questSubtypeLabel = (subtype: string) => QUEST_SUBTYPE_LABELS[subtype] || subtype;
  const targetActionLabel = (action: string) => TARGET_ACTION_LABELS[action] || action;

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
    sort: 10,
    active: true,
  };
  const modalForm = ref({ ...defaultModalForm });

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
      targetCount: record.targetCount,
      expReward: record.expReward,
      hpReward: record.hpReward ?? 0,
      sort: record.sort,
      active: record.active,
    };
    modalVisible.value = true;
  };

  const handleModalOk = async () => {
    if (!modalForm.value.code || !modalForm.value.name) {
      Message.warning('编码和名称不能为空');
      return;
    }
    if (isEdit.value) {
      const { code, ...data } = modalForm.value;
      await updateQuest(editId.value, data);
      Message.success('更新成功');
    } else {
      await createQuest(modalForm.value);
      Message.success('新增成功');
    }
    modalVisible.value = false;
    loadData();
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
</style>
