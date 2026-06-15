<template>
  <div class="container">
    <a-card class="general-card" title="抽奖奖池管理">
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
                    placeholder="请输入奖品名称"
                    allow-clear
                    @press-enter="search"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="稀有度">
                  <a-select v-model="formModel.rarity" placeholder="请选择稀有度" allow-clear>
                    <a-option value="common">普通</a-option>
                    <a-option value="rare">稀有</a-option>
                    <a-option value="epic">史诗</a-option>
                    <a-option value="legendary">传说</a-option>
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
              新增奖品
            </a-button>
            <a-button @click="showRecordsModal">抽奖记录</a-button>
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
        :scroll="{ x: 1000, y: 600 }"
      >
        <template #columns>
          <a-table-column title="状态" data-index="active" :width="80">
            <template #cell="{ record }">
              <a-tag :color="record.active ? 'green' : 'red'">
                {{ record.active ? '启用' : '禁用' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="编码" data-index="code" :width="130" />
          <a-table-column title="名称" data-index="name" :width="120" />
          <a-table-column title="描述" data-index="description" :width="160" ellipsis tooltip />
          <a-table-column title="类型" data-index="type" :width="80">
            <template #cell="{ record }">
              <a-tag>{{ poolTypeLabel(record.type) }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="稀有度" data-index="rarity" :width="80">
            <template #cell="{ record }">
              <a-tag :color="rarityColor(record.rarity)">
                {{ rarityLabel(record.rarity) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="概率" data-index="probability" :width="80" align="center">
            <template #cell="{ record }"> {{ (record.probability * 100).toFixed(1) }}% </template>
          </a-table-column>
          <a-table-column title="排序" data-index="sort" :width="60" align="center" />
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
      :title="isEdit ? '编辑奖品' : '新增奖品'"
      :width="720"
      @ok="handleModalOk"
      @cancel="modalVisible = false"
    >
      <a-form :model="modalForm" :label-col-props="{ span: 7 }" :wrapper-col-props="{ span: 17 }">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="编码" required>
              <a-input v-model="modalForm.code" placeholder="奖品编码" :disabled="isEdit" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="名称" required>
              <a-input v-model="modalForm.name" placeholder="奖品名称" allow-clear />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="描述">
              <a-input v-model="modalForm.description" placeholder="奖品描述" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="奖品类型">
              <a-select v-model="modalForm.type">
                <a-option value="exp">经验</a-option>
                <a-option value="buff">Buff</a-option>
                <a-option value="ticket">抽奖券</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="稀有度">
              <a-select v-model="modalForm.rarity">
                <a-option value="common">普通</a-option>
                <a-option value="rare">稀有</a-option>
                <a-option value="epic">史诗</a-option>
                <a-option value="legendary">传说</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="概率(0-1)">
              <a-input-number
                v-model="modalForm.probability"
                :min="0"
                :max="1"
                :step="0.01"
                :precision="2"
                placeholder="0到1之间的小数"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="排序"> </a-form-item>
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
      </a-form>
    </a-modal>

    <a-modal v-model:visible="recordsVisible" title="抽奖记录" :width="700" :footer="false">
      <a-row :gutter="16" style="margin-bottom: 12px">
        <a-col :span="8">
          <a-input v-model="recordsQuery.uid" placeholder="用户ID" allow-clear />
        </a-col>
        <a-col :span="8">
          <a-select v-model="recordsQuery.rarity" placeholder="请选择稀有度" allow-clear>
            <a-option value="common">普通</a-option>
            <a-option value="rare">稀有</a-option>
            <a-option value="epic">史诗</a-option>
            <a-option value="legendary">传说</a-option>
          </a-select>
        </a-col>
        <a-col :span="8">
          <a-button type="primary" @click="loadRecords">搜索</a-button>
        </a-col>
      </a-row>
      <a-table
        :loading="recordsLoading"
        row-key="id"
        :pagination="false"
        :data="recordsData"
        :bordered="false"
        scrollbar
        :scroll="{ x: 600, y: 400 }"
      >
        <template #columns>
          <a-table-column title="用户ID" data-index="uid" :width="80" />
          <a-table-column title="奖品名称" data-index="poolName" :width="160" />
          <a-table-column title="稀有度" data-index="poolRarity" :width="80">
            <template #cell="{ record }">
              <a-tag :color="rarityColor(record.poolRarity)">
                {{ rarityLabel(record.poolRarity) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="抽奖时间" data-index="createTime" :width="160">
            <template #cell="{ record }">
              {{ $dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
            </template>
          </a-table-column>
        </template>
      </a-table>
      <TablePagination
        :total="recordsPagination.total"
        :current="recordsPagination.current"
        :page-size="recordsPagination.pageSize"
        @change="onRecordsPageChange"
        @page-size-change="onRecordsPageSizeChange"
      />
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
  import {
    getLotteryPoolList,
    createLotteryPool,
    updateLotteryPool,
    deleteLotteryPool,
    getLotteryRecordList,
  } from '@/api/rpg';
  import useLoading from '@/hooks/loading';

  const POOL_TYPE_LABELS: Record<string, string> = {
    exp: '经验',
    buff: 'Buff',
    ticket: '抽奖券',
    achievement: '成就',
    title: '称号',
    avatar_frame: '头像框',
    pet: '宠物',
    consumable: '消耗品',
    equipment: '装备',
    currency: '钻石',
    unknown: '未知',
  };

  const RARITY_LABELS: Record<string, string> = {
    common: '普通',
    rare: '稀有',
    epic: '史诗',
    legendary: '传说',
  };

  const poolTypeLabel = (type: string) => POOL_TYPE_LABELS[type] || type;
  const rarityLabel = (rarity: string) => RARITY_LABELS[rarity] || rarity;
  const rarityColor = (rarity: string) => {
    const map: Record<string, string> = {
      common: 'gray',
      rare: 'blue',
      epic: 'purple',
      legendary: 'orangered',
    };
    return map[rarity] || 'gray';
  };

  const { loading, setLoading } = useLoading(true);

  const generateFormModel = () => ({
    keyword: '',
    rarity: undefined as string | undefined,
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
    type: 'exp',
    rarity: 'common',
    probability: 0.1,
    rewardData: {},
    sort: 10,
    active: true,
  };
  const modalForm = ref({ ...defaultModalForm });

  const loadData = async () => {
    setLoading(true);
    try {
      const res: any = await getLotteryPoolList(formModel.value);
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
      rarity: record.rarity,
      probability: record.probability,
      rewardData: record.rewardData || {},
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
      await updateLotteryPool(editId.value, data);
      Message.success('更新成功');
    } else {
      await createLotteryPool(modalForm.value);
      Message.success('新增成功');
    }
    modalVisible.value = false;
    loadData();
  };

  const handleDelete = (record: any) => {
    Modal.confirm({
      title: '删除奖品',
      content: '确定删除该奖品吗？删除后不可恢复。',
      onOk: async () => {
        await deleteLotteryPool(record.id);
        Message.success('删除成功');
        loadData();
      },
    });
  };

  const recordsVisible = ref(false);
  const recordsLoading = ref(false);
  const recordsData = ref<any[]>([]);
  const recordsQuery = ref({ uid: '', rarity: undefined as string | undefined });
  const recordsPagination = reactive<Pagination>({ current: 1, pageSize: 20, total: 0 });

  const showRecordsModal = () => {
    recordsVisible.value = true;
    recordsQuery.value = { uid: '', rarity: undefined };
    recordsPagination.current = 1;
    loadRecords();
  };

  const loadRecords = async () => {
    recordsLoading.value = true;
    try {
      const params: Record<string, any> = {
        page: recordsPagination.current,
        pageSize: recordsPagination.pageSize,
      };
      if (recordsQuery.value.uid) params.uid = recordsQuery.value.uid;
      if (recordsQuery.value.rarity) params.rarity = recordsQuery.value.rarity;
      const res: any = await getLotteryRecordList(params);
      recordsData.value = res.data.list;
      recordsPagination.total = res.data.pagination.total;
    } finally {
      recordsLoading.value = false;
    }
  };

  const onRecordsPageChange = (current: number) => {
    recordsPagination.current = current;
    loadRecords();
  };

  const onRecordsPageSizeChange = (pageSize: number) => {
    recordsPagination.current = 1;
    recordsPagination.pageSize = pageSize;
    loadRecords();
  };
</script>

<script lang="ts">
  export default { name: 'RpgLotteryTable' };
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
