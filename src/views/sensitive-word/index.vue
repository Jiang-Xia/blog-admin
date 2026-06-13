<template>
  <div class="container">
    <a-card class="general-card" :title="t('sensitiveWord.query.title')">
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
                <a-form-item :label="t('sensitiveWord.form.keyword')">
                  <a-input
                    v-model="formModel.keyword"
                    :placeholder="t('sensitiveWord.form.placeholder.keyword')"
                    @press-enter="search"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item :label="t('sensitiveWord.form.category')">
                  <a-select
                    v-model="formModel.category"
                    :placeholder="t('sensitiveWord.form.placeholder.category')"
                    allow-clear
                  >
                    <a-option value="系统默认">系统默认</a-option>
                    <a-option value="广告">广告</a-option>
                    <a-option value="色情">色情</a-option>
                    <a-option value="赌博">赌博</a-option>
                    <a-option value="政治">政治</a-option>
                    <a-option value="自定义">自定义</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item :label="t('sensitiveWord.form.status')">
                  <a-select
                    v-model="formModel.status"
                    :placeholder="t('sensitiveWord.form.placeholder.category')"
                    allow-clear
                  >
                    <a-option :value="1">{{ t('sensitiveWord.table.status.enabled') }}</a-option>
                    <a-option :value="0">{{ t('sensitiveWord.table.status.disabled') }}</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-col>
        <a-col :span="5" style="text-align: right">
          <a-space :size="8">
            <a-button type="primary" @click="search">
              <template #icon>
                <icon-search />
              </template>
              {{ t('sensitiveWord.button.search') }}
            </a-button>
            <a-button @click="reset">
              <template #icon>
                <icon-refresh />
              </template>
              {{ t('sensitiveWord.button.reset') }}
            </a-button>
          </a-space>
        </a-col>
      </a-row>

      <a-divider style="margin-top: 0" />

      <a-row style="margin-bottom: 16px">
        <a-col :span="16">
          <a-space>
            <a-button type="primary" @click="showCreateModal">
              <template #icon>
                <icon-plus />
              </template>
              {{ t('sensitiveWord.button.create') }}
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
        :scroll="{ x: 1100, y: 600 }"
      >
        <template #columns>
          <a-table-column :title="t('sensitiveWord.table.word')" data-index="word" :width="140" />
          <a-table-column
            :title="t('sensitiveWord.table.category')"
            data-index="category"
            :width="120"
          />
          <a-table-column title="等级" data-index="level" :width="70" />
          <a-table-column title="扣HP" data-index="hpPenalty" :width="70" />
          <a-table-column title="需审核" data-index="needReview" :width="80">
            <template #cell="{ record }">
              {{ record.needReview === 1 ? '是' : '否' }}
            </template>
          </a-table-column>
          <a-table-column title="动作" data-index="action" :width="90">
            <template #cell="{ record }">
              {{ record.action === 2 ? '拒绝' : record.action === 3 ? '仅记录' : '替换' }}
            </template>
          </a-table-column>
          <a-table-column :title="t('sensitiveWord.table.status')" data-index="status" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.status === 1 ? 'green' : 'red'">
                {{
                  record.status === 1
                    ? t('sensitiveWord.table.status.enabled')
                    : t('sensitiveWord.table.status.disabled')
                }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column
            :title="t('sensitiveWord.table.createTime')"
            data-index="createTime"
            :width="170"
          >
            <template #cell="{ record }">
              {{ $dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
            </template>
          </a-table-column>
          <a-table-column
            :title="t('sensitiveWord.table.operation')"
            data-index="operations"
            :width="120"
            fixed="right"
          >
            <template #cell="{ record }">
              <a-space :size="8">
                <a-button size="mini" type="primary" @click="showEditModal(record)">
                  <icon-edit />
                </a-button>
                <a-button size="mini" type="primary" status="danger" @click="handleDelete(record)">
                  <icon-delete />
                </a-button>
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

    <!-- 新增/编辑弹窗 -->
    <a-modal
      v-model:visible="modalVisible"
      :title="isEdit ? t('sensitiveWord.modal.edit') : t('sensitiveWord.modal.create')"
      @ok="handleModalOk"
      @cancel="modalVisible = false"
    >
      <a-form :model="modalForm" :label-col-props="{ span: 5 }" :wrapper-col-props="{ span: 18 }">
        <a-form-item :label="t('sensitiveWord.form.wordLabel')" required>
          <a-input
            v-model="modalForm.word"
            :placeholder="t('sensitiveWord.form.placeholder.word')"
          />
        </a-form-item>
        <a-form-item :label="t('sensitiveWord.form.categoryLabel')">
          <a-select v-model="modalForm.category" allow-clear>
            <a-option value="系统默认">系统默认</a-option>
            <a-option value="广告">广告</a-option>
            <a-option value="色情">色情</a-option>
            <a-option value="赌博">赌博</a-option>
            <a-option value="政治">政治</a-option>
            <a-option value="自定义">自定义</a-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="t('sensitiveWord.form.statusLabel')">
          <a-radio-group v-model="modalForm.status">
            <a-radio :value="1">{{ t('sensitiveWord.table.status.enabled') }}</a-radio>
            <a-radio :value="0">{{ t('sensitiveWord.table.status.disabled') }}</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="等级">
          <a-select v-model="modalForm.level">
            <a-option :value="1">1-轻</a-option>
            <a-option :value="2">2-中</a-option>
            <a-option :value="3">3-重</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="扣HP">
          <a-input-number v-model="modalForm.hpPenalty" :min="0" :max="100" />
        </a-form-item>
        <a-form-item label="需审核">
          <a-radio-group v-model="modalForm.needReview">
            <a-radio :value="1">是</a-radio>
            <a-radio :value="0">否</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="动作">
          <a-select v-model="modalForm.action">
            <a-option :value="1">替换</a-option>
            <a-option :value="2">拒绝</a-option>
            <a-option :value="3">仅记录</a-option>
          </a-select>
        </a-form-item>
      </a-form>
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
    getSensitiveWordList,
    createSensitiveWord,
    updateSensitiveWord,
    deleteSensitiveWord,
  } from '@/api/sensitive-word';
  import useLoading from '@/hooks/loading';

  const { t } = useI18n();
  const { loading, setLoading } = useLoading(true);

  const generateFormModel = () => ({
    keyword: '',
    category: '',
    status: undefined as number | undefined,
    page: 1,
    pageSize: 20,
  });

  const formModel = ref(generateFormModel());
  const tableData = ref<any[]>([]);
  const basePagination: Pagination = { current: 1, pageSize: 20, total: 0 };
  const pagination = reactive({ ...basePagination });

  // 弹窗
  const modalVisible = ref(false);
  const isEdit = ref(false);
  const editId = ref<number>(0);
  const modalForm = ref({
    word: '',
    category: '自定义',
    status: 1,
    level: 2,
    hpPenalty: 20,
    needReview: 1,
    action: 1,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res: any = await getSensitiveWordList(formModel.value);
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
    modalForm.value = {
      word: '',
      category: '自定义',
      status: 1,
      level: 2,
      hpPenalty: 20,
      needReview: 1,
      action: 1,
    };
    modalVisible.value = true;
  };

  const showEditModal = (record: any) => {
    isEdit.value = true;
    editId.value = record.id;
    modalForm.value = {
      word: record.word,
      category: record.category,
      status: record.status,
      level: record.level ?? 2,
      hpPenalty: record.hpPenalty ?? 20,
      needReview: record.needReview ?? 1,
      action: record.action ?? 1,
    };
    modalVisible.value = true;
  };

  const handleModalOk = async () => {
    if (!modalForm.value.word) {
      Message.warning(t('sensitiveWord.form.placeholder.word'));
      return;
    }
    if (isEdit.value) {
      await updateSensitiveWord(editId.value, modalForm.value);
      Message.success(t('sensitiveWord.message.updateSuccess'));
    } else {
      await createSensitiveWord({ word: modalForm.value.word, category: modalForm.value.category });
      Message.success(t('sensitiveWord.message.createSuccess'));
    }
    modalVisible.value = false;
    loadData();
  };

  const handleDelete = (record: any) => {
    Modal.confirm({
      title: t('sensitiveWord.confirm.delete'),
      content: t('sensitiveWord.confirm.deleteContent'),
      onOk: async () => {
        await deleteSensitiveWord(record.id);
        Message.success(t('sensitiveWord.message.deleteSuccess'));
        loadData();
      },
    });
  };
</script>

<script lang="ts">
  export default {
    name: 'SensitiveWordTable',
  };
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
