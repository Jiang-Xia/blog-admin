<template>
  <div class="container">
    <!-- <Breadcrumb :items="['menu.list', 'menu.list.searchTable']" /> -->
    <a-card class="general-card" :title="t('tag.query.title')">
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
                <a-form-item :label="t('tag.form.name')">
                  <a-input
                    v-model="formModel.title"
                    :placeholder="t('tag.form.placeholder.name')"
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
            <a-button v-permission="'tag:create'" type="primary" @click="addHandle">
              <template #icon>
                <icon-plus />
              </template>
              {{ t('tag.button.create') }}
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
          <a-table-column :title="t('tag.table.name')" data-index="label" />
          <a-table-column :title="t('tag.table.articleCount')" data-index="articleCount">
            <template #cell="{ record }">
              <a-tag :color="record.color" size="small">{{ record.articleCount }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column :title="t('tag.table.color')" data-index="color">
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
                  v-permission="'tag:update'"
                  size="mini"
                  type="primary"
                  @click="editHandle(record)"
                >
                  <icon-edit />
                </a-button>
                <a-button
                  v-permission="'tag:delete'"
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
        :type="t('tag.form.name')"
        @ok="
          ({ name, type }) => {
            ceateOkHandle({ name, type, cb: search });
          }
        "
      />
      <CreateModal
        v-model:value="editVisibale"
        :edit-data="editRecord"
        :type="t('tag.form.name')"
        @ok="
          ({ name, type, id }) => {
            editOkHandle({ name, type, id });
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
  import { useTableNoPageList } from '@/hooks/data';
  import CreateModal from '../category/create-modal.vue';
  import { ceateOkHandle, delCategoryTag, updateCategoryTag } from '../article/common';

  const { t } = useI18n();

  const generateFormModel = () => {
    return {
      page: 1,
      category: '',
      tags: [],
      pageSize: 20,
      total: 0,
      title: '',
      description: '',
      content: '',
      uid: 1,
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
  const editVisibale = ref(false);
  const editRecord = ref<Record<string, any> | undefined>(undefined);

  const {
    action,
    loading,
    list: renderData,
    loadMore,
  } = useTableNoPageList('/tag', formModel.value);
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
  const delHandle = async (id: string) => {
    Modal.confirm({
      title: t('tag.confirm.delete'),
      content: t('common.confirm.content'),
      onOk: async () => {
        const res = await delCategoryTag(t('tag.form.name'), id);
        Message.success(t('tag.message.deleteSuccess'));
        search();
      },
    });
  };

  const editHandle = (record: Record<string, any>) => {
    editRecord.value = record;
    editVisibale.value = true;
  };

  const editOkHandle = async ({ name, type, id }: { name: string; type: string; id: string }) => {
    await updateCategoryTag({ name, type, id, cb: search });
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
