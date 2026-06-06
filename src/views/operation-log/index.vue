<template>
  <div class="container">
    <a-card class="general-card" :title="t('operationLog.query.title')">
      <a-row>
        <a-col :flex="1">
          <a-form
            :model="formModel"
            :label-col-props="{ span: 6 }"
            :wrapper-col-props="{ span: 18 }"
            label-align="left"
          >
            <a-row :gutter="16">
              <a-col :span="6">
                <a-form-item :label="t('operationLog.form.username')">
                  <a-input
                    v-model="formModel.username"
                    :placeholder="t('operationLog.form.placeholder.username')"
                    @press-enter="search"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item :label="t('operationLog.form.module')">
                  <a-select
                    v-model="formModel.module"
                    :placeholder="t('operationLog.form.placeholder.module')"
                    allow-clear
                  >
                    <a-option value="article">article</a-option>
                    <a-option value="category">category</a-option>
                    <a-option value="tag">tag</a-option>
                    <a-option value="user">user</a-option>
                    <a-option value="comment">comment</a-option>
                    <a-option value="reply">reply</a-option>
                    <a-option value="msgboard">msgboard</a-option>
                    <a-option value="link">link</a-option>
                    <a-option value="system">system</a-option>
                    <a-option value="admin">admin</a-option>
                    <a-option value="sensitive-word">sensitive-word</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item :label="t('operationLog.form.action')">
                  <a-select
                    v-model="formModel.action"
                    :placeholder="t('operationLog.form.placeholder.action')"
                    allow-clear
                  >
                    <a-option value="create">{{ t('operationLog.table.action.create') }}</a-option>
                    <a-option value="update">{{ t('operationLog.table.action.update') }}</a-option>
                    <a-option value="delete">{{ t('operationLog.table.action.delete') }}</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="6" style="text-align: right">
                <a-space :size="8">
                  <a-button type="primary" @click="search">
                    <template #icon><icon-search /></template>
                    {{ t('operationLog.button.search') }}
                  </a-button>
                  <a-button @click="reset">
                    <template #icon><icon-refresh /></template>
                    {{ t('operationLog.button.reset') }}
                  </a-button>
                </a-space>
              </a-col>
            </a-row>
          </a-form>
        </a-col>
      </a-row>

      <a-divider style="margin-top: 0" />

      <a-row style="margin-bottom: 16px">
        <a-col :span="16">
          <a-space>
            <a-button status="danger" @click="handleClean">
              <template #icon><icon-delete /></template>
              {{ t('operationLog.button.clean') }}
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
          <a-table-column :title="t('operationLog.table.id')" data-index="id" :width="70" />
          <a-table-column
            :title="t('operationLog.table.username')"
            data-index="username"
            :width="120"
          />
          <a-table-column :title="t('operationLog.table.module')" data-index="module" :width="120">
            <template #cell="{ record }">
              <a-tag color="arcoblue">{{ record.module }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column :title="t('operationLog.table.action')" data-index="action" :width="100">
            <template #cell="{ record }">
              <a-tag :color="actionColorMap[record.action] || 'gray'">
                {{ t(`operationLog.table.action.${record.action}`) || record.action }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column :title="t('operationLog.table.method')" data-index="method" :width="90">
            <template #cell="{ record }">
              <a-tag :color="methodColorMap[record.method] || 'gray'" size="small">
                {{ record.method }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column
            :title="t('operationLog.table.path')"
            data-index="path"
            :ellipsis="true"
            :width="200"
          />
          <a-table-column
            :title="t('operationLog.table.description')"
            data-index="description"
            :ellipsis="true"
          />
          <a-table-column :title="t('operationLog.table.ip')" data-index="ip" :width="130" />
          <a-table-column
            :title="t('operationLog.table.statusCode')"
            data-index="statusCode"
            :width="90"
          >
            <template #cell="{ record }">
              <a-tag :color="record.statusCode < 400 ? 'green' : 'red'">
                {{ record.statusCode }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column
            :title="t('operationLog.table.createTime')"
            data-index="createTime"
            :width="170"
          >
            <template #cell="{ record }">
              {{ $dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
            </template>
          </a-table-column>
          <a-table-column :title="t('operationLog.table.requestBody')" :width="80">
            <template #cell="{ record }">
              <a-button
                v-if="record.requestBody"
                size="mini"
                type="text"
                @click="showDetail(record)"
              >
                <icon-eye />
              </a-button>
              <span v-else>-</span>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 请求体详情弹窗 -->
    <a-modal
      v-model:visible="detailVisible"
      :title="t('operationLog.detail.title')"
      :footer="false"
      :width="680"
    >
      <a-descriptions :column="2" bordered size="small">
        <a-descriptions-item :label="t('operationLog.table.username')">
          {{ currentRecord?.username }}
        </a-descriptions-item>
        <a-descriptions-item :label="t('operationLog.table.module')">
          {{ currentRecord?.module }}
        </a-descriptions-item>
        <a-descriptions-item :label="t('operationLog.table.method')">
          {{ currentRecord?.method }}
        </a-descriptions-item>
        <a-descriptions-item :label="t('operationLog.table.statusCode')">
          {{ currentRecord?.statusCode }}
        </a-descriptions-item>
        <a-descriptions-item :label="t('operationLog.table.path')" :span="2">
          {{ currentRecord?.path }}
        </a-descriptions-item>
        <a-descriptions-item :label="t('operationLog.table.description')" :span="2">
          {{ currentRecord?.description }}
        </a-descriptions-item>
        <a-descriptions-item :label="t('operationLog.table.requestBody')" :span="2">
          <pre class="request-body-pre">{{ formatRequestBody(currentRecord?.requestBody) }}</pre>
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import { useI18n } from 'vue-i18n';
  import type { Pagination } from '@/types/global';
  import { Message, Modal } from '@arco-design/web-vue';
  import { IconSearch, IconRefresh, IconDelete, IconEye } from '@arco-design/web-vue/es/icon';
  import { getOperationLogList, cleanOperationLog } from '@/api/operation-log';
  import useLoading from '@/hooks/loading';

  const { t } = useI18n();
  const { loading, setLoading } = useLoading(true);

  const actionColorMap: Record<string, string> = {
    create: 'green',
    update: 'orangered',
    delete: 'red',
  };

  const methodColorMap: Record<string, string> = {
    POST: 'green',
    PUT: 'orangered',
    PATCH: 'orange',
    DELETE: 'red',
  };

  const generateFormModel = () => ({
    username: '',
    module: undefined as string | undefined,
    action: undefined as string | undefined,
    page: 1,
    pageSize: 20,
  });

  const formModel = ref(generateFormModel());
  const tableData = ref<any[]>([]);
  const basePagination: Pagination = { current: 1, pageSize: 20, total: 0 };
  const pagination = reactive({ ...basePagination });

  // 详情弹窗
  const detailVisible = ref(false);
  const currentRecord = ref<any>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res: any = await getOperationLogList(formModel.value);
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

  const showDetail = (record: any) => {
    currentRecord.value = record;
    detailVisible.value = true;
  };

  const formatRequestBody = (body: string | null) => {
    if (!body) return '-';
    try {
      return JSON.stringify(JSON.parse(body), null, 2);
    } catch {
      return body;
    }
  };

  const handleClean = () => {
    Modal.confirm({
      title: t('operationLog.confirm.clean'),
      content: t('operationLog.confirm.cleanContent'),
      onOk: async () => {
        const res: any = await cleanOperationLog();
        const deleted = res.data?.deleted ?? 0;
        Message.success(`${t('operationLog.message.cleanSuccess')}，共删除 ${deleted} 条`);
        loadData();
      },
    });
  };
</script>

<script lang="ts">
  export default {
    name: 'OperationLogTable',
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

  .request-body-pre {
    margin: 0;
    max-height: 300px;
    overflow: auto;
    font-size: 12px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-all;
    background: var(--color-fill-2);
    padding: 12px;
    border-radius: 4px;
  }
</style>
