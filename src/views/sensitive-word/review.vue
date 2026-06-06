<template>
  <div class="container">
    <a-card class="general-card" :title="t('sensitiveWordReview.query.title')">
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
                <a-form-item :label="t('sensitiveWordReview.form.sourceType')">
                  <a-select
                    v-model="formModel.sourceType"
                    :placeholder="t('sensitiveWordReview.form.placeholder.sourceType')"
                    allow-clear
                  >
                    <a-option value="comment">{{
                      t('sensitiveWordReview.table.sourceType.comment')
                    }}</a-option>
                    <a-option value="msgboard">{{
                      t('sensitiveWordReview.table.sourceType.msgboard')
                    }}</a-option>
                    <a-option value="reply">{{
                      t('sensitiveWordReview.table.sourceType.reply')
                    }}</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item :label="t('sensitiveWordReview.form.status')">
                  <a-select
                    v-model="formModel.status"
                    :placeholder="t('sensitiveWordReview.form.placeholder.status')"
                    allow-clear
                  >
                    <a-option value="pending">{{
                      t('sensitiveWordReview.table.status.pending')
                    }}</a-option>
                    <a-option value="approved">{{
                      t('sensitiveWordReview.table.status.approved')
                    }}</a-option>
                    <a-option value="rejected">{{
                      t('sensitiveWordReview.table.status.rejected')
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

      <a-table
        :loading="loading"
        row-key="id"
        :pagination="pagination"
        :data="tableData"
        :bordered="false"
        @page-change="onPageChange"
      >
        <template #columns>
          <a-table-column
            :title="t('sensitiveWordReview.table.sourceType')"
            data-index="sourceType"
            :width="80"
            align="center"
          >
            <template #cell="{ record }">
              <a-tag :color="sourceTypeColorMap[record.sourceType] || 'gray'">
                {{ getSourceTypeText(record.sourceType) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column
            :title="t('sensitiveWordReview.table.content')"
            data-index="content"
            :width="300"
            tooltip
            ellipsis
          />
          <a-table-column
            :title="t('sensitiveWordReview.table.hitWords')"
            data-index="hitWords"
            :width="180"
          >
            <template #cell="{ record }">
              <a-space wrap>
                <a-tag
                  v-for="word in record.hitWords.split(',')"
                  :key="word"
                  color="red"
                  size="small"
                >
                  {{ word }}
                </a-tag>
              </a-space>
            </template>
          </a-table-column>
          <a-table-column
            :title="t('sensitiveWordReview.table.uid')"
            data-index="uid"
            :width="80"
            align="center"
          >
            <template #cell="{ record }">
              {{ record.uid || '-' }}
            </template>
          </a-table-column>
          <a-table-column :title="t('sensitiveWordReview.table.ip')" data-index="ip" :width="130" />
          <a-table-column
            :title="t('sensitiveWordReview.table.status')"
            data-index="status"
            :width="100"
            align="center"
          >
            <template #cell="{ record }">
              <a-tag
                :color="
                  record.status === 'pending'
                    ? 'orange'
                    : record.status === 'approved'
                      ? 'green'
                      : 'red'
                "
              >
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column
            :title="t('sensitiveWordReview.table.createTime')"
            data-index="createTime"
            :width="170"
          >
            <template #cell="{ record }">
              {{ $dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
            </template>
          </a-table-column>
          <a-table-column
            :title="t('sensitiveWordReview.table.reviewTime')"
            data-index="reviewTime"
            :width="170"
          >
            <template #cell="{ record }">
              {{
                record.reviewTime ? $dayjs(record.reviewTime).format('YYYY-MM-DD HH:mm:ss') : '-'
              }}
            </template>
          </a-table-column>
          <a-table-column
            :title="t('sensitiveWordReview.table.operation')"
            data-index="operations"
            :width="150"
            fixed="right"
          >
            <template #cell="{ record }">
              <a-space v-if="record.status === 'pending'" :size="8">
                <a-button
                  size="mini"
                  type="primary"
                  status="success"
                  @click="handleApprove(record)"
                >
                  {{ t('sensitiveWordReview.button.approve') }}
                </a-button>
                <a-button size="mini" type="primary" status="danger" @click="handleReject(record)">
                  {{ t('sensitiveWordReview.button.reject') }}
                </a-button>
              </a-space>
              <span v-else>-</span>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import { useI18n } from 'vue-i18n';
  import type { Pagination } from '@/types/global';
  import { Message, Modal } from '@arco-design/web-vue';
  import { IconSearch, IconRefresh } from '@arco-design/web-vue/es/icon';
  import { getHitRecordList, approveHitRecord, rejectHitRecord } from '@/api/sensitive-word';
  import useLoading from '@/hooks/loading';

  const { t } = useI18n();
  const { loading, setLoading } = useLoading(true);

  const generateFormModel = () => ({
    sourceType: '',
    status: '',
    page: 1,
    pageSize: 20,
  });

  const formModel = ref(generateFormModel());
  const tableData = ref<any[]>([]);
  const basePagination: Pagination = { current: 1, pageSize: 20, total: 0 };
  const pagination = reactive({ ...basePagination });

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      pending: t('sensitiveWordReview.table.status.pending'),
      approved: t('sensitiveWordReview.table.status.approved'),
      rejected: t('sensitiveWordReview.table.status.rejected'),
    };
    return map[status] || status;
  };

  // 来源类型颜色映射
  const sourceTypeColorMap: Record<string, string> = {
    comment: 'blue',
    msgboard: 'orange',
    reply: 'green',
  };

  // 获取来源类型文本
  const getSourceTypeText = (sourceType: string) => {
    const key = `sensitiveWordReview.table.sourceType.${sourceType}` as const;
    return t(key);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { ...formModel.value };
      // 清除空值
      if (!params.sourceType) delete params.sourceType;
      if (!params.status) delete params.status;
      const res: any = await getHitRecordList(params);
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

  const handleApprove = (record: any) => {
    Modal.confirm({
      title: t('sensitiveWordReview.confirm.approve'),
      onOk: async () => {
        await approveHitRecord(record.id);
        Message.success(t('sensitiveWordReview.message.approveSuccess'));
        loadData();
      },
    });
  };

  const handleReject = (record: any) => {
    Modal.confirm({
      title: t('sensitiveWordReview.confirm.reject'),
      onOk: async () => {
        await rejectHitRecord(record.id);
        Message.success(t('sensitiveWordReview.message.rejectSuccess'));
        loadData();
      },
    });
  };
</script>

<script lang="ts">
  export default {
    name: 'SensitiveWordReview',
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
