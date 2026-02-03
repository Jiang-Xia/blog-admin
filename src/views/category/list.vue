<template>
  <div class="container">
    <!-- <Breadcrumb :items="['menu.list', 'menu.list.searchTable']" /> -->
    <a-card class="general-card" :title="t('category.query.title')">
      <a-row>
        <a-col :flex="1">
          <a-form
            :model="formModel"
            :label-col-props="{ span: 6 }"
            :wrapper-col-props="{ span: 18 }"
            label-align="left"
          >
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item :label="t('category.form.name')">
                  <a-input
                    v-model="formModel.title"
                    :placeholder="t('category.form.placeholder.name')"
                  />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-col>
        <a-col :span="10" style="text-align: right">
          <a-space :size="8">
            <a-button type="primary" @click="search">
              <template #icon>
                <icon-search />
              </template>
              {{ t('common.button.search') }}
            </a-button>
            <a-button @click="reset">
              <template #icon>
                <icon-refresh />
              </template>
              {{ t('common.button.reset') }}
            </a-button>
          </a-space>
        </a-col>
      </a-row>

      <a-divider style="margin-top: 0" />

      <a-row style="margin-bottom: 16px">
        <a-col :span="16">
          <a-space>
            <a-button v-permission="'category:create'" type="primary" @click="addHandle">
              <template #icon>
                <icon-plus />
              </template>
              {{ t('category.button.create') }}
            </a-button>
          </a-space>
        </a-col>
      </a-row>
      <a-table
        :loading="loading"
        row-key="id"
        :pagination="pagination"
        :data="renderData"
        :bordered="false"
        @page-change="onPageChange"
      >
        <template #columns>
          <a-table-column :title="t('category.table.name')" data-index="label" />
          <a-table-column :title="t('category.table.articleCount')" data-index="articleCount">
            <template #cell="{ record }">
              <a-tag :color="record.color" size="small">{{ record.articleCount }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column :title="t('category.table.color')" data-index="color">
            <template #cell="{ record }">
              <a-tag :color="record.color" size="small">{{ record.color }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column :title="t('common.table.createTime')" data-index="createAt">
            <template #cell="{ record }">
              {{ formateDate(record.createAt) }}
            </template>
          </a-table-column>
          <a-table-column :title="t('common.table.operation')" data-index="operations">
            <template #cell="{ record }">
              <a-space :size="8">
                <a-button
                  v-permission="'category:update'"
                  size="mini"
                  type="primary"
                  @click="editHandle(record)"
                >
                  <icon-edit />
                </a-button>
                <a-button
                  v-permission="'category:delete'"
                  size="mini"
                  type="primary"
                  status="danger"
                  @click="delHandle(record.id)"
                >
                  <icon-delete />
                </a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
      <CreateModal
        v-model:value="visibale"
        :type="t('category.form.name')"
        @ok="
          ({ name, type }) => {
            ceateOkHandle({ name, type, cb: search });
          }
        "
      />
      <CreateModal
        v-model:value="editVisible"
        :type="t('category.form.name')"
        :edit-data="editData"
        @ok="
          ({ name, type, id }) => {
            updateCategoryHandle({ name, type, id, cb: search });
          }
        "
      />
    </a-card>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import { useI18n } from 'vue-i18n';
  import type { Pagination } from '@/types/global';
  import { Message, Modal } from '@arco-design/web-vue';
  import { formateDate } from '@/utils';
  import {
    IconEdit,
    IconDelete,
    IconPlus,
    IconSearch,
    IconRefresh,
  } from '@arco-design/web-vue/es/icon';
  import { useTableNoPageList } from '@/hooks/data';
  import CreateModal from './create-modal.vue';
  import { ceateOkHandle, delCategoryTag } from '../article/common';
  import { updateCategory } from '@/api/category';

  const { t } = useI18n();

  const generateFormModel = () => {
    return {
      title: '',
    };
  };
  const formModel = ref(generateFormModel());
  const basePagination: Pagination = {
    current: 1,
    pageSize: 999,
  };
  const pagination = reactive({
    ...basePagination,
  });
  const visibale = ref(false);
  const editData = ref<Record<string, any> | undefined>(undefined);
  const editVisible = ref(false);
  const {
    action,
    loading,
    list: renderData,
    loadMore,
  } = useTableNoPageList('/category', formModel.value);
  const search = () => {
    action.value = formModel.value;
    loadMore();
  };
  const onPageChange = (current: number) => {
    search();
  };
  const reset = () => {
    formModel.value = generateFormModel();
    search();
  };

  const addHandle = () => {
    visibale.value = true;
  };

  const editHandle = (record: Record<string, any>) => {
    editData.value = record;
    editVisible.value = true;
  };
  const delHandle = async (id: string) => {
    Modal.confirm({
      title: t('category.confirm.deleteTitle'),
      content: t('category.confirm.deleteContent'),
      onOk: async () => {
        const res = await delCategoryTag(t('category.form.name'), id);
        Message.success(t('category.message.deleteSuccess'));
        search();
      },
    });
  };

  const updateCategoryHandle = async ({
    name,
    type,
    id,
    cb,
  }: {
    name: string;
    type: string;
    id: string;
    cb: () => void;
  }) => {
    const res = await updateCategory({ id, label: name, value: name });
    Message.success(t('category.message.updateSuccess'));
    cb();
  };
</script>

<script lang="ts">
  export default {
    name: 'SearchTable',
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
