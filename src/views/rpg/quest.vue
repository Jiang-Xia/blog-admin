<template>
  <div class="container">
    <a-card class="general-card" :title="t('rpgQuest.query.title')">
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
                <a-form-item :label="t('rpgQuest.form.keyword')">
                  <a-input
                    v-model="formModel.keyword"
                    :placeholder="t('rpgQuest.form.placeholder.keyword')"
                    @press-enter="search"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item :label="t('rpgQuest.form.type')">
                  <a-select
                    v-model="formModel.type"
                    :placeholder="t('rpgQuest.form.placeholder.type')"
                    allow-clear
                  >
                    <a-option value="daily">{{ t('rpgQuest.table.type.daily') }}</a-option>
                    <a-option value="weekly">{{ t('rpgQuest.table.type.weekly') }}</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item :label="t('rpgQuest.form.status')">
                  <a-select v-model="formModel.active" allow-clear>
                    <a-option value="true">{{ t('rpgQuest.table.active.enabled') }}</a-option>
                    <a-option value="false">{{ t('rpgQuest.table.active.disabled') }}</a-option>
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
              {{ t('rpgQuest.button.search') }}
            </a-button>
            <a-button @click="reset">
              <template #icon><icon-refresh /></template>
              {{ t('rpgQuest.button.reset') }}
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
              {{ t('rpgQuest.button.create') }}
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
          <a-table-column :title="t('rpgQuest.table.code')" data-index="code" :width="140" />
          <a-table-column :title="t('rpgQuest.table.name')" data-index="name" :width="110" />
          <a-table-column
            :title="t('rpgQuest.table.description')"
            data-index="description"
            :ellipsis="{ showTooltip: true }"
          />
          <a-table-column :title="t('rpgQuest.table.type')" data-index="type" :width="80">
            <template #cell="{ record }">
              <a-tag :color="record.type === 'daily' ? 'blue' : 'purple'">
                {{ t(`rpgQuest.table.type.${record.type}`) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column
            :title="t('rpgQuest.table.targetAction')"
            data-index="targetAction"
            :width="100"
          >
            <template #cell="{ record }">
              {{ t(`rpgQuest.table.targetAction.${record.targetAction}`) }}
            </template>
          </a-table-column>
          <a-table-column
            :title="t('rpgQuest.table.targetCount')"
            data-index="targetCount"
            :width="90"
            align="center"
          />
          <a-table-column
            :title="t('rpgQuest.table.expReward')"
            data-index="expReward"
            :width="90"
            align="center"
          >
            <template #cell="{ record }">
              <span style="color: #f59e0b; font-weight: 600">+{{ record.expReward }}</span>
            </template>
          </a-table-column>
          <a-table-column
            :title="t('rpgQuest.table.sort')"
            data-index="sort"
            :width="60"
            align="center"
          />
          <a-table-column :title="t('rpgQuest.table.active')" data-index="active" :width="80">
            <template #cell="{ record }">
              <a-tag :color="record.active ? 'green' : 'red'">
                {{
                  record.active
                    ? t('rpgQuest.table.active.enabled')
                    : t('rpgQuest.table.active.disabled')
                }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column
            :title="t('rpgQuest.table.operation')"
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
      :title="isEdit ? t('rpgQuest.modal.edit') : t('rpgQuest.modal.create')"
      :width="720"
      @ok="handleModalOk"
      @cancel="modalVisible = false"
    >
      <a-form :model="modalForm" :label-col-props="{ span: 7 }" :wrapper-col-props="{ span: 17 }">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="t('rpgQuest.form.codeLabel')" required>
              <a-input
                v-model="modalForm.code"
                :placeholder="t('rpgQuest.form.placeholder.code')"
                :disabled="isEdit"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('rpgQuest.form.nameLabel')" required>
              <a-input
                v-model="modalForm.name"
                :placeholder="t('rpgQuest.form.placeholder.name')"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="t('rpgQuest.form.descLabel')">
              <a-input
                v-model="modalForm.description"
                :placeholder="t('rpgQuest.form.placeholder.desc')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('rpgQuest.form.typeLabel')">
              <a-select v-model="modalForm.type">
                <a-option value="daily">{{ t('rpgQuest.table.type.daily') }}</a-option>
                <a-option value="weekly">{{ t('rpgQuest.table.type.weekly') }}</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="t('rpgQuest.form.targetActionLabel')">
              <a-select v-model="modalForm.targetAction">
                <a-option value="sign_in">{{ t('rpgQuest.table.targetAction.sign_in') }}</a-option>
                <a-option value="comment">{{ t('rpgQuest.table.targetAction.comment') }}</a-option>
                <a-option value="article">{{ t('rpgQuest.table.targetAction.article') }}</a-option>
                <a-option value="like">{{ t('rpgQuest.table.targetAction.like') }}</a-option>
                <a-option value="collect">{{ t('rpgQuest.table.targetAction.collect') }}</a-option>
                <a-option value="msgboard">{{
                  t('rpgQuest.table.targetAction.msgboard')
                }}</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('rpgQuest.form.targetCountLabel')">
              <a-input-number v-model="modalForm.targetCount" :min="1" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="t('rpgQuest.form.expRewardLabel')">
              <a-input-number v-model="modalForm.expReward" :min="0" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('rpgQuest.form.sortLabel')">
              <a-input-number v-model="modalForm.sort" :min="0" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="t('rpgQuest.form.activeLabel')">
              <a-radio-group v-model="modalForm.active">
                <a-radio :value="true">{{ t('rpgQuest.table.active.enabled') }}</a-radio>
                <a-radio :value="false">{{ t('rpgQuest.table.active.disabled') }}</a-radio>
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
  import { getQuestList, createQuest, updateQuest, deleteQuest } from '@/api/rpg';
  import useLoading from '@/hooks/loading';

  const { t } = useI18n();
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
    targetAction: 'sign_in',
    targetCount: 1,
    expReward: 10,
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
      targetAction: record.targetAction,
      targetCount: record.targetCount,
      expReward: record.expReward,
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
      Message.success(t('rpgQuest.message.updateSuccess'));
    } else {
      await createQuest(modalForm.value);
      Message.success(t('rpgQuest.message.createSuccess'));
    }
    modalVisible.value = false;
    loadData();
  };

  const handleDelete = (record: any) => {
    Modal.confirm({
      title: t('rpgQuest.confirm.delete'),
      content: t('rpgQuest.confirm.deleteContent'),
      onOk: async () => {
        await deleteQuest(record.id);
        Message.success(t('rpgQuest.message.deleteSuccess'));
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
