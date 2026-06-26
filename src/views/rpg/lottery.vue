<template>
  <div class="container">
    <a-card class="general-card" title="抽奖奖池管理">
      <a-form
        :model="formModel"
        layout="horizontal"
        :label-col-props="{ flex: '76px' }"
        :wrapper-col-props="{ flex: '1' }"
        label-align="right"
        class="pool-filter-form"
      >
        <a-row :gutter="16">
          <a-col :span="6">
            <a-form-item label="关键词">
              <a-input
                v-model="formModel.keyword"
                placeholder="奖品名称或编码"
                allow-clear
                @press-enter="search"
              />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="物品类型">
              <a-select v-model="formModel.itemType" placeholder="全部类型" allow-clear>
                <a-option value="title">称号</a-option>
                <a-option value="avatar_frame">头像框</a-option>
                <a-option value="pet">宠物</a-option>
                <a-option value="consumable">消耗品</a-option>
                <a-option value="buff">Buff</a-option>
                <a-option value="achievement">成就</a-option>
                <a-option value="equipment">装备</a-option>
                <a-option value="currency">钻石</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="稀有度">
              <a-select v-model="formModel.rarity" placeholder="全部稀有度" allow-clear>
                <a-option value="common">普通</a-option>
                <a-option value="rare">稀有</a-option>
                <a-option value="epic">史诗</a-option>
                <a-option value="legendary">传说</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="状态">
              <a-select v-model="formModel.active" allow-clear placeholder="全部状态">
                <a-option value="true">启用</a-option>
                <a-option value="false">禁用</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label=" " class="filter-actions-item">
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
        </a-form-item>
      </a-form>

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
        :scroll="{ x: 1100, y: 600 }"
      >
        <template #columns>
          <a-table-column title="状态" data-index="active" :width="80">
            <template #cell="{ record }">
              <a-tag :color="record.active ? 'green' : 'red'">
                {{ record.active ? '启用' : '禁用' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="关联" data-index="itemLinked" :width="90">
            <template #cell="{ record }">
              <a-tag :color="record.itemLinked === false ? 'red' : 'green'">
                {{ record.itemLinked === false ? '未关联' : '已关联' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="物品编码" data-index="itemCode" :width="140" />
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
      :title="isEdit ? '编辑奖池条目' : '新增奖池条目'"
      :width="640"
      @before-ok="handleModalOk"
      @cancel="modalVisible = false"
    >
      <a-alert v-if="!isEdit" type="info" class="pool-modal-tip">
        奖池奖品须从「系统物品」选择，名称/描述/发放逻辑由系统物品决定。
      </a-alert>
      <a-form
        :model="modalForm"
        layout="horizontal"
        :label-col-props="{ flex: '96px' }"
        :wrapper-col-props="{ flex: '1' }"
        class="pool-modal-form"
      >
        <a-form-item label="系统物品" required>
          <a-select
            v-model="modalForm.itemCode"
            placeholder="请选择系统物品"
            allow-search
            allow-clear
            :disabled="isEdit"
            :loading="itemOptionsLoading"
            @change="onItemCodeChange"
          >
            <a-option
              v-for="item in itemOptions"
              :key="item.code"
              :value="item.code"
              :label="`${item.name} (${item.code})`"
            >
              {{ item.name }} ({{ item.code }}) · {{ itemTypeLabel(item.itemType) }}
            </a-option>
          </a-select>
        </a-form-item>

        <template v-if="selectedItem">
          <a-divider orientation="left">物品信息</a-divider>
          <a-descriptions :column="2" size="small" bordered class="pool-item-preview">
            <a-descriptions-item label="名称">{{ selectedItem.name }}</a-descriptions-item>
            <a-descriptions-item label="类型">
              {{ itemTypeLabel(selectedItem.itemType) }}
            </a-descriptions-item>
            <a-descriptions-item label="编码">{{ selectedItem.code }}</a-descriptions-item>
            <a-descriptions-item label="物品稀有度">
              {{ rarityLabel(selectedItem.rarity) }}
            </a-descriptions-item>
            <a-descriptions-item label="描述" :span="2">
              {{ selectedItem.description || '—' }}
            </a-descriptions-item>
          </a-descriptions>
        </template>

        <a-divider orientation="left">奖池配置</a-divider>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="展示稀有度">
              <a-select v-model="modalForm.rarity">
                <a-option value="common">普通</a-option>
                <a-option value="rare">稀有</a-option>
                <a-option value="epic">史诗</a-option>
                <a-option value="legendary">传说</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="概率">
              <a-input-number
                v-model="modalForm.probability"
                :min="0"
                :max="1"
                :step="0.01"
                :precision="2"
                placeholder="0 ~ 1"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="排序">
              <a-input-number v-model="modalForm.sort" :min="0" :step="1" style="width: 100%" />
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
  import {
    getLotteryPoolList,
    createLotteryPool,
    updateLotteryPool,
    deleteLotteryPool,
    getLotteryRecordList,
    getItemConfigList,
  } from '@/api/rpg';
  import useLoading from '@/hooks/loading';

  interface ItemOption {
    code: string;
    name: string;
    description: string;
    itemType: string;
    rarity: string;
    active: boolean;
  }

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

  const ITEM_TYPE_LABELS: Record<string, string> = {
    title: '称号',
    avatar_frame: '头像框',
    pet: '宠物',
    consumable: '消耗品',
    buff: 'Buff',
    achievement: '成就',
    equipment: '装备',
    currency: '钻石',
  };

  const RARITY_LABELS: Record<string, string> = {
    common: '普通',
    rare: '稀有',
    epic: '史诗',
    legendary: '传说',
  };

  const poolTypeLabel = (type: string) => POOL_TYPE_LABELS[type] || type;
  const itemTypeLabel = (type: string) => ITEM_TYPE_LABELS[type] || type;
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
    itemType: undefined as string | undefined,
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
    itemCode: '',
    rarity: 'common',
    probability: 0.1,
    sort: 10,
    active: true,
  };
  const modalForm = ref({ ...defaultModalForm });

  const itemOptions = ref<ItemOption[]>([]);
  const itemOptionsLoading = ref(false);

  const selectedItem = computed(() =>
    itemOptions.value.find((item) => item.code === modalForm.value.itemCode),
  );

  /** 加载可选系统物品（仅启用项，供奖池关联） */
  const loadItemOptions = async () => {
    itemOptionsLoading.value = true;
    try {
      const res: any = await getItemConfigList({ page: 1, pageSize: 500 });
      itemOptions.value = (res.data.list || []).filter((item: ItemOption) => item.active);
    } finally {
      itemOptionsLoading.value = false;
    }
  };

  const onItemCodeChange = (code: string) => {
    const item = itemOptions.value.find((entry) => entry.code === code);
    if (item && !isEdit.value) {
      modalForm.value.rarity = item.rarity || 'common';
    }
  };

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

  const showCreateModal = async () => {
    isEdit.value = false;
    editId.value = 0;
    modalForm.value = { ...defaultModalForm };
    modalVisible.value = true;
    await loadItemOptions();
  };

  const showEditModal = async (record: any) => {
    isEdit.value = true;
    editId.value = record.id;
    await loadItemOptions();
    modalForm.value = {
      itemCode: record.itemCode || record.code,
      rarity: record.rarity,
      probability: record.probability,
      sort: record.sort,
      active: record.active,
    };
    modalVisible.value = true;
  };

  const buildPoolPayload = () => ({
    itemCode: modalForm.value.itemCode,
    probability: modalForm.value.probability,
    rarity: modalForm.value.rarity,
    sort: modalForm.value.sort,
    active: modalForm.value.active,
  });

  const handleModalOk = async () => {
    if (!modalForm.value.itemCode) {
      Message.warning('请选择系统物品');
      return false;
    }
    if (modalForm.value.probability == null) {
      Message.warning('请填写概率');
      return false;
    }
    try {
      if (isEdit.value) {
        const { itemCode, ...data } = buildPoolPayload();
        await updateLotteryPool(editId.value, data);
        Message.success('更新成功');
      } else {
        await createLotteryPool(buildPoolPayload());
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

  .pool-filter-form {
    :deep(.arco-form-item) {
      margin-bottom: 16px;
    }

    :deep(.arco-form-item-label) {
      white-space: nowrap;
    }

    :deep(.arco-select),
    :deep(.arco-input-wrapper) {
      width: 100%;
    }
  }

  .filter-actions-item {
    margin-bottom: 0;

    :deep(.arco-form-item-label-col) {
      visibility: hidden;
    }
  }

  .pool-modal-tip {
    margin-bottom: 16px;
  }

  .pool-modal-form {
    :deep(.arco-divider-text-left) {
      margin: 4px 0 12px;
      font-size: 13px;
      font-weight: 600;
      color: var(--color-text-2);
    }

    :deep(.arco-row) {
      width: 100%;
    }

    :deep(.arco-form-item) {
      margin-bottom: 16px;
    }
  }

  .pool-item-preview {
    margin-bottom: 4px;
  }
</style>
