<template>
  <div class="container">
    <a-card class="general-card" :title="t('rpgLottery.query.title')">
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
                <a-form-item :label="t('rpgLottery.form.keyword')">
                  <a-input
                    v-model="formModel.keyword"
                    :placeholder="t('rpgLottery.form.placeholder.keyword')"
                    @press-enter="search"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item :label="t('rpgLottery.form.rarity')">
                  <a-select
                    v-model="formModel.rarity"
                    :placeholder="t('rpgLottery.form.placeholder.rarity')"
                    allow-clear
                  >
                    <a-option value="common">{{ t('rpgLottery.table.rarity.common') }}</a-option>
                    <a-option value="rare">{{ t('rpgLottery.table.rarity.rare') }}</a-option>
                    <a-option value="epic">{{ t('rpgLottery.table.rarity.epic') }}</a-option>
                    <a-option value="legendary">{{
                      t('rpgLottery.table.rarity.legendary')
                    }}</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item :label="t('rpgLottery.form.status')">
                  <a-select v-model="formModel.active" allow-clear>
                    <a-option value="true">{{ t('rpgLottery.table.active.enabled') }}</a-option>
                    <a-option value="false">{{ t('rpgLottery.table.active.disabled') }}</a-option>
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
              {{ t('rpgLottery.button.search') }}
            </a-button>
            <a-button @click="reset">
              <template #icon><icon-refresh /></template>
              {{ t('rpgLottery.button.reset') }}
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
              {{ t('rpgLottery.button.create') }}
            </a-button>
            <a-button @click="showRecordsModal">
              {{ t('rpgLottery.button.records') }}
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
          <a-table-column :title="t('rpgLottery.table.code')" data-index="code" :width="130" />
          <a-table-column :title="t('rpgLottery.table.name')" data-index="name" :width="120" />
          <a-table-column
            :title="t('rpgLottery.table.description')"
            data-index="description"
            ellipsis
            tooltip
          />
          <a-table-column :title="t('rpgLottery.table.type')" data-index="type" :width="80">
            <template #cell="{ record }">
              <a-tag>{{ t(`rpgLottery.table.type.${record.type}`) }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column :title="t('rpgLottery.table.rarity')" data-index="rarity" :width="80">
            <template #cell="{ record }">
              <a-tag :color="rarityColor(record.rarity)">
                {{ t(`rpgLottery.table.rarity.${record.rarity}`) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column
            :title="t('rpgLottery.table.probability')"
            data-index="probability"
            :width="80"
            align="center"
          >
            <template #cell="{ record }"> {{ (record.probability * 100).toFixed(1) }}% </template>
          </a-table-column>
          <a-table-column
            :title="t('rpgLottery.table.sort')"
            data-index="sort"
            :width="60"
            align="center"
          />
          <a-table-column :title="t('rpgLottery.table.active')" data-index="active" :width="80">
            <template #cell="{ record }">
              <a-tag :color="record.active ? 'green' : 'red'">
                {{
                  record.active
                    ? t('rpgLottery.table.active.enabled')
                    : t('rpgLottery.table.active.disabled')
                }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column
            :title="t('rpgLottery.table.operation')"
            data-index="operations"
            :width="120"
          >
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

    <!-- 新增/编辑弹窗 -->
    <a-modal
      v-model:visible="modalVisible"
      :title="isEdit ? t('rpgLottery.modal.edit') : t('rpgLottery.modal.create')"
      :width="720"
      @ok="handleModalOk"
      @cancel="modalVisible = false"
    >
      <a-form :model="modalForm" :label-col-props="{ span: 7 }" :wrapper-col-props="{ span: 17 }">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="t('rpgLottery.form.codeLabel')" required>
              <a-input
                v-model="modalForm.code"
                :placeholder="t('rpgLottery.form.placeholder.code')"
                :disabled="isEdit"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('rpgLottery.form.nameLabel')" required>
              <a-input
                v-model="modalForm.name"
                :placeholder="t('rpgLottery.form.placeholder.name')"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="t('rpgLottery.form.descLabel')">
              <a-input
                v-model="modalForm.description"
                :placeholder="t('rpgLottery.form.placeholder.desc')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('rpgLottery.form.typeLabel')">
              <a-select v-model="modalForm.type">
                <a-option value="exp">{{ t('rpgLottery.table.type.exp') }}</a-option>
                <a-option value="buff">{{ t('rpgLottery.table.type.buff') }}</a-option>
                <a-option value="ticket">{{ t('rpgLottery.table.type.ticket') }}</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="t('rpgLottery.form.rarityLabel')">
              <a-select v-model="modalForm.rarity">
                <a-option value="common">{{ t('rpgLottery.table.rarity.common') }}</a-option>
                <a-option value="rare">{{ t('rpgLottery.table.rarity.rare') }}</a-option>
                <a-option value="epic">{{ t('rpgLottery.table.rarity.epic') }}</a-option>
                <a-option value="legendary">{{ t('rpgLottery.table.rarity.legendary') }}</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('rpgLottery.form.probabilityLabel')">
              <a-input-number
                v-model="modalForm.probability"
                :min="0"
                :max="1"
                :step="0.01"
                :precision="2"
                :placeholder="t('rpgLottery.form.placeholder.probability')"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="t('rpgLottery.form.sortLabel')">
              <a-input-number v-model="modalForm.sort" :min="0" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('rpgLottery.form.activeLabel')">
              <a-radio-group v-model="modalForm.active">
                <a-radio :value="true">{{ t('rpgLottery.table.active.enabled') }}</a-radio>
                <a-radio :value="false">{{ t('rpgLottery.table.active.disabled') }}</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>

    <!-- 抽奖记录弹窗 -->
    <a-modal
      v-model:visible="recordsVisible"
      :title="t('rpgLottery.records.title')"
      :width="700"
      :footer="false"
    >
      <a-row :gutter="16" style="margin-bottom: 12px">
        <a-col :span="8">
          <a-input
            v-model="recordsQuery.uid"
            :placeholder="t('rpgLottery.records.uid')"
            allow-clear
          />
        </a-col>
        <a-col :span="8">
          <a-select
            v-model="recordsQuery.rarity"
            :placeholder="t('rpgLottery.form.placeholder.rarity')"
            allow-clear
          >
            <a-option value="common">{{ t('rpgLottery.table.rarity.common') }}</a-option>
            <a-option value="rare">{{ t('rpgLottery.table.rarity.rare') }}</a-option>
            <a-option value="epic">{{ t('rpgLottery.table.rarity.epic') }}</a-option>
            <a-option value="legendary">{{ t('rpgLottery.table.rarity.legendary') }}</a-option>
          </a-select>
        </a-col>
        <a-col :span="8">
          <a-button type="primary" @click="loadRecords">{{
            t('rpgLottery.button.search')
          }}</a-button>
        </a-col>
      </a-row>
      <a-table
        :loading="recordsLoading"
        row-key="id"
        :pagination="recordsPagination"
        :data="recordsData"
        :bordered="false"
        @page-change="onRecordsPageChange"
      >
        <template #columns>
          <a-table-column :title="t('rpgLottery.records.uid')" data-index="uid" :width="80" />
          <a-table-column :title="t('rpgLottery.records.poolName')" data-index="poolName" />
          <a-table-column
            :title="t('rpgLottery.records.poolRarity')"
            data-index="poolRarity"
            :width="80"
          >
            <template #cell="{ record }">
              <a-tag :color="rarityColor(record.poolRarity)">
                {{ t(`rpgLottery.table.rarity.${record.poolRarity}`) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column
            :title="t('rpgLottery.records.createTime')"
            data-index="createTime"
            :width="160"
          >
            <template #cell="{ record }">
              {{ $dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import { useI18n } from 'vue-i18n';
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

  const { t } = useI18n();
  const { loading, setLoading } = useLoading(true);

  const rarityColor = (rarity: string) => {
    const map: Record<string, string> = {
      common: 'gray',
      rare: 'blue',
      epic: 'purple',
      legendary: 'orangered',
    };
    return map[rarity] || 'gray';
  };

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
      Message.success(t('rpgLottery.message.updateSuccess'));
    } else {
      await createLotteryPool(modalForm.value);
      Message.success(t('rpgLottery.message.createSuccess'));
    }
    modalVisible.value = false;
    loadData();
  };

  const handleDelete = (record: any) => {
    Modal.confirm({
      title: t('rpgLottery.confirm.delete'),
      content: t('rpgLottery.confirm.deleteContent'),
      onOk: async () => {
        await deleteLotteryPool(record.id);
        Message.success(t('rpgLottery.message.deleteSuccess'));
        loadData();
      },
    });
  };

  // 抽奖记录
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
