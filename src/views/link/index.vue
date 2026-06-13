<template>
  <div class="container">
    <!-- <Breadcrumb :items="['menu.list', 'menu.list.searchTable']" /> -->
    <a-card class="general-card" :title="t('link.query.title')">
      <a-row style="margin-bottom: 16px">
        <a-col :span="16">
          <!-- <a-space>
            <a-button type="primary">
              <template #icon>
                <icon-plus />
              </template>
              {{ t('link.button.add') }}
            </a-button>
          </a-space> -->
        </a-col>
      </a-row>
      <a-table
        :loading="loading"
        row-key="id"
        :pagination="false"
        :data="tableData"
        :bordered="false"
        scrollbar
        :scroll="{ x: 980, y: 600 }"
      >
        <template #columns>
          <a-table-column :title="t('link.table.title')" data-index="title" :width="160" />
          <a-table-column
            :title="t('link.table.icon')"
            data-index="url"
            align="center"
            :width="100"
          >
            <template #cell="{ record }">
              <a-avatar>
                <img :alt="record.title" :src="record.icon" />
              </a-avatar>
            </template>
          </a-table-column>
          <a-table-column :title="t('link.table.description')" data-index="desp" :width="200" />
          <a-table-column :title="t('link.table.website')" data-index="url" :width="260">
            <template #cell="{ record }">
              <a-link :href="record.url" target="_blank">{{ record.url }}</a-link>
            </template>
          </a-table-column>
          <a-table-column :title="t('link.table.status')" data-index="url" :width="100">
            <template #cell="{ record }">
              <!-- :disabled="record.agreed" -->
              <a-switch v-model="record.agreed" @change="onSwitchChange(record)">
                <template #checked-icon>
                  <icon-check />
                </template>
                <template #unchecked-icon>
                  <icon-close />
                </template>
              </a-switch>
            </template>
          </a-table-column>
          <a-table-column
            :title="t('link.table.operation')"
            data-index="operations"
            :width="120"
            fixed="right"
          >
            <template #cell="{ record }">
              <a-space :size="8">
                <a-button size="mini" type="primary" status="danger" @click="delHandle(record.id)">
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
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, reactive, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import useLoading from '@/hooks/loading';
  import type { Pagination } from '@/types/global';
  import { Message, Modal } from '@arco-design/web-vue';
  import request from '@/api/request';

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
  const { loading, setLoading } = useLoading(true);
  const { t } = useI18n();
  const renderData = ref([]);
  const formModel = ref(generateFormModel());
  const basePagination: Pagination = {
    current: 1,
    pageSize: 20,
    total: 0,
  };
  const pagination = reactive({
    ...basePagination,
  });
  const getListHandle = async (val = 1) => {
    setLoading(true);
    const res = await request.get('/link');
    renderData.value = res.data;
    pagination.total = res.data.length;
    setLoading(false);
  };
  watch(
    () => renderData.value,
    (list) => {
      pagination.total = list.length;
    },
    { immediate: true },
  );
  const tableData = computed(() => {
    const start = (pagination.current - 1) * pagination.pageSize;
    return renderData.value.slice(start, start + pagination.pageSize);
  });
  const search = () => {
    pagination.current = 1;
    getListHandle();
  };
  const onPageChange = (current: number) => {
    pagination.current = current;
  };
  const onPageSizeChange = (pageSize: number) => {
    pagination.current = 1;
    pagination.pageSize = pageSize;
    formModel.value.pageSize = pageSize;
  };
  getListHandle();
  const reset = () => {
    formModel.value = generateFormModel();
  };
  const delHandle = async (id: number) => {
    Modal.confirm({
      title: t('link.confirm.delete'),
      content: t('link.confirm.deleteContent'),
      onOk: async () => {
        const res = await request.delete('/link', { params: { id } });
        Message.success(t('link.message.deleteSuccess'));
        getListHandle();
      },
    });
  };
  const onSwitchChange = async (record: any) => {
    const { agreed, id } = record;
    const res = await request.patch(`/link`, { agreed, id });
    Message.success(t('link.message.setSuccess'));
  };
</script>

<script lang="ts">
  export default {
    name: 'LinkTable',
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
