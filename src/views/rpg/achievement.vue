<template>
  <div class="container">
    <a-card class="general-card" :title="t('rpgAchievement.query.title')">
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
                <a-form-item :label="t('rpgAchievement.form.keyword')">
                  <a-input
                    v-model="formModel.keyword"
                    :placeholder="t('rpgAchievement.form.placeholder.keyword')"
                    @press-enter="search"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item :label="t('rpgAchievement.form.category')">
                  <a-select
                    v-model="formModel.category"
                    :placeholder="t('rpgAchievement.form.placeholder.category')"
                    allow-clear
                  >
                    <a-option value="creation">{{
                      t('rpgAchievement.table.category.creation')
                    }}</a-option>
                    <a-option value="social">{{
                      t('rpgAchievement.table.category.social')
                    }}</a-option>
                    <a-option value="exploration">{{
                      t('rpgAchievement.table.category.exploration')
                    }}</a-option>
                    <a-option value="sign">{{ t('rpgAchievement.table.category.sign') }}</a-option>
                    <a-option value="special">{{
                      t('rpgAchievement.table.category.special')
                    }}</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item :label="t('rpgAchievement.form.status')">
                  <a-select v-model="formModel.active" allow-clear>
                    <a-option value="true">{{ t('rpgAchievement.table.active.enabled') }}</a-option>
                    <a-option value="false">{{
                      t('rpgAchievement.table.active.disabled')
                    }}</a-option>
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
              {{ t('rpgAchievement.button.search') }}
            </a-button>
            <a-button @click="reset">
              <template #icon><icon-refresh /></template>
              {{ t('rpgAchievement.button.reset') }}
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
              {{ t('rpgAchievement.button.create') }}
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
          <a-table-column :title="t('rpgAchievement.table.code')" data-index="code" :width="140" />
          <a-table-column :title="t('rpgAchievement.table.name')" data-index="name" :width="120" />
          <a-table-column
            :title="t('rpgAchievement.table.description')"
            data-index="description"
            :ellipsis="{ showTooltip: true }"
          />
          <a-table-column
            :title="t('rpgAchievement.table.category')"
            data-index="category"
            :width="90"
          >
            <template #cell="{ record }">
              <a-tag>{{ t(`rpgAchievement.table.category.${record.category}`) }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column :title="t('rpgAchievement.table.icon')" data-index="icon" :width="110" />
          <a-table-column
            :title="t('rpgAchievement.table.maxProgress')"
            data-index="maxProgress"
            :width="90"
            align="center"
          />
          <a-table-column
            :title="t('rpgAchievement.table.expReward')"
            data-index="expReward"
            :width="90"
            align="center"
          >
            <template #cell="{ record }">
              <span style="color: #f59e0b; font-weight: 600">+{{ record.expReward }}</span>
            </template>
          </a-table-column>
          <a-table-column
            :title="t('rpgAchievement.table.sort')"
            data-index="sort"
            :width="60"
            align="center"
          />
          <a-table-column :title="t('rpgAchievement.table.active')" data-index="active" :width="80">
            <template #cell="{ record }">
              <a-tag :color="record.active !== false ? 'green' : 'red'">
                {{
                  record.active !== false
                    ? t('rpgAchievement.table.active.enabled')
                    : t('rpgAchievement.table.active.disabled')
                }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column
            :title="t('rpgAchievement.table.operation')"
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
      :title="isEdit ? t('rpgAchievement.modal.edit') : t('rpgAchievement.modal.create')"
      :width="720"
      @ok="handleModalOk"
      @cancel="modalVisible = false"
    >
      <a-form :model="modalForm" :label-col-props="{ span: 7 }" :wrapper-col-props="{ span: 17 }">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="t('rpgAchievement.form.codeLabel')" required>
              <a-input
                v-model="modalForm.code"
                :placeholder="t('rpgAchievement.form.placeholder.code')"
                :disabled="isEdit"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('rpgAchievement.form.nameLabel')" required>
              <a-input
                v-model="modalForm.name"
                :placeholder="t('rpgAchievement.form.placeholder.name')"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="t('rpgAchievement.form.descLabel')">
              <a-input
                v-model="modalForm.description"
                :placeholder="t('rpgAchievement.form.placeholder.desc')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('rpgAchievement.form.categoryLabel')">
              <a-select v-model="modalForm.category">
                <a-option value="creation">{{
                  t('rpgAchievement.table.category.creation')
                }}</a-option>
                <a-option value="social">{{ t('rpgAchievement.table.category.social') }}</a-option>
                <a-option value="exploration">{{
                  t('rpgAchievement.table.category.exploration')
                }}</a-option>
                <a-option value="sign">{{ t('rpgAchievement.table.category.sign') }}</a-option>
                <a-option value="special">{{
                  t('rpgAchievement.table.category.special')
                }}</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="t('rpgAchievement.form.iconLabel')">
              <a-input
                v-model="modalForm.icon"
                :placeholder="t('rpgAchievement.form.placeholder.icon')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('rpgAchievement.form.maxProgressLabel')">
              <a-input-number
                v-model="modalForm.maxProgress"
                :min="1"
                :placeholder="t('rpgAchievement.form.placeholder.maxProgress')"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="t('rpgAchievement.form.expRewardLabel')">
              <a-input-number
                v-model="modalForm.expReward"
                :min="0"
                :placeholder="t('rpgAchievement.form.placeholder.expReward')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('rpgAchievement.form.sortLabel')">
              <a-input-number v-model="modalForm.sort" :min="0" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="t('rpgAchievement.form.activeLabel')">
              <a-radio-group v-model="modalForm.active">
                <a-radio :value="true">{{ t('rpgAchievement.table.active.enabled') }}</a-radio>
                <a-radio :value="false">{{ t('rpgAchievement.table.active.disabled') }}</a-radio>
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
  import {
    getAchievementList,
    createAchievement,
    updateAchievement,
    deleteAchievement,
  } from '@/api/rpg';
  import useLoading from '@/hooks/loading';

  const { t } = useI18n();
  const { loading, setLoading } = useLoading(true);

  const generateFormModel = () => ({
    keyword: '',
    category: undefined as string | undefined,
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
    category: 'creation',
    icon: 'trophy',
    maxProgress: 1,
    expReward: 10,
    sort: 10,
    active: true,
  };
  const modalForm = ref({ ...defaultModalForm });

  const loadData = async () => {
    setLoading(true);
    try {
      const res: any = await getAchievementList(formModel.value);
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
      category: record.category,
      icon: record.icon || 'trophy',
      maxProgress: record.maxProgress,
      expReward: record.expReward,
      sort: record.sort,
      active: record.active !== false,
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
      await updateAchievement(editId.value, data);
      Message.success(t('rpgAchievement.message.updateSuccess'));
    } else {
      await createAchievement(modalForm.value);
      Message.success(t('rpgAchievement.message.createSuccess'));
    }
    modalVisible.value = false;
    loadData();
  };

  const handleDelete = (record: any) => {
    Modal.confirm({
      title: t('rpgAchievement.confirm.delete'),
      content: t('rpgAchievement.confirm.deleteContent'),
      onOk: async () => {
        await deleteAchievement(record.id);
        Message.success(t('rpgAchievement.message.deleteSuccess'));
        loadData();
      },
    });
  };
</script>

<script lang="ts">
  export default { name: 'RpgAchievementTable' };
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
