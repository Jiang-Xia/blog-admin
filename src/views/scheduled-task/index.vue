<template>
  <div class="container">
    <a-card class="general-card" :title="t('scheduledTask.query.title')">
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
                <a-form-item :label="t('scheduledTask.form.taskName')">
                  <a-select
                    v-model="formModel.taskName"
                    :placeholder="t('scheduledTask.form.placeholder.taskName')"
                    allow-clear
                  >
                    <a-option v-for="task in taskOptions" :key="task.value" :value="task.value">
                      {{ task.label }}
                    </a-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item :label="t('scheduledTask.form.status')">
                  <a-select
                    v-model="formModel.status"
                    :placeholder="t('scheduledTask.form.placeholder.status')"
                    allow-clear
                  >
                    <a-option value="success">{{
                      t('scheduledTask.table.status.success')
                    }}</a-option>
                    <a-option value="failed">{{ t('scheduledTask.table.status.failed') }}</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="6" style="text-align: right">
                <a-space :size="8">
                  <a-button type="primary" @click="search">
                    <template #icon><icon-search /></template>
                    {{ t('scheduledTask.button.search') }}
                  </a-button>
                  <a-button @click="reset">
                    <template #icon><icon-refresh /></template>
                    {{ t('scheduledTask.button.reset') }}
                  </a-button>
                </a-space>
              </a-col>
            </a-row>
          </a-form>
        </a-col>
      </a-row>

      <a-divider style="margin-top: 0" />

      <a-table
        :loading="loading"
        row-key="id"
        :pagination="pagination"
        :data="tableData"
        :bordered="false"
        @page-change="onPageChange"
      >
        <template #columns>
          <a-table-column :title="t('scheduledTask.table.id')" data-index="id" :width="70" />
          <a-table-column
            :title="t('scheduledTask.table.taskName')"
            data-index="taskName"
            :width="160"
          >
            <template #cell="{ record }">
              <a-tag color="arcoblue">
                {{ taskNameMap[record.taskName] || record.taskName }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column :title="t('scheduledTask.table.status')" data-index="status" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.status === 'success' ? 'green' : 'red'">
                {{ t(`scheduledTask.table.status.${record.status}`) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column :title="t('scheduledTask.table.result')" :width="120">
            <template #cell="{ record }">
              <a-button v-if="record.result" size="mini" type="text" @click="showDetail(record)">
                <icon-eye />
                {{ t('scheduledTask.detail.title') }}
              </a-button>
              <span v-else>-</span>
            </template>
          </a-table-column>
          <a-table-column
            :title="t('scheduledTask.table.errorMessage')"
            data-index="errorMessage"
            :ellipsis="true"
            :width="200"
          >
            <template #cell="{ record }">
              <span v-if="record.errorMessage" style="color: rgb(var(--danger-6))">
                {{ record.errorMessage }}
              </span>
              <span v-else>-</span>
            </template>
          </a-table-column>
          <a-table-column
            :title="t('scheduledTask.table.startTime')"
            data-index="startTime"
            :width="170"
          >
            <template #cell="{ record }">
              {{ $dayjs(record.startTime).format('YYYY-MM-DD HH:mm:ss') }}
            </template>
          </a-table-column>
          <a-table-column
            :title="t('scheduledTask.table.endTime')"
            data-index="endTime"
            :width="170"
          >
            <template #cell="{ record }">
              {{ record.endTime ? $dayjs(record.endTime).format('YYYY-MM-DD HH:mm:ss') : '-' }}
            </template>
          </a-table-column>
          <a-table-column :title="t('scheduledTask.table.duration')" :width="100">
            <template #cell="{ record }">
              {{ calcDuration(record.startTime, record.endTime) }}
            </template>
          </a-table-column>
          <a-table-column
            :title="t('scheduledTask.table.createTime')"
            data-index="createTime"
            :width="170"
          >
            <template #cell="{ record }">
              {{ $dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 执行详情弹窗 -->
    <a-modal
      v-model:visible="detailVisible"
      :title="t('scheduledTask.detail.title')"
      :footer="false"
      :width="600"
    >
      <!-- 每日互动通知详情 -->
      <a-descriptions
        v-if="parsedResult && currentRecord?.taskName === 'daily_interaction_notify'"
        :column="2"
        bordered
        size="small"
      >
        <a-descriptions-item :label="t('scheduledTask.result.commentCount')">
          {{ parsedResult.commentCount ?? '-' }}
        </a-descriptions-item>
        <a-descriptions-item :label="t('scheduledTask.result.prevCommentCount')">
          {{ parsedResult.prevCommentCount ?? '-' }}
        </a-descriptions-item>
        <a-descriptions-item :label="t('scheduledTask.result.replyCount')">
          {{ parsedResult.replyCount ?? '-' }}
        </a-descriptions-item>
        <a-descriptions-item :label="t('scheduledTask.result.prevReplyCount')">
          {{ parsedResult.prevReplyCount ?? '-' }}
        </a-descriptions-item>
        <a-descriptions-item :label="t('scheduledTask.result.msgboardCount')">
          {{ parsedResult.msgboardCount ?? '-' }}
        </a-descriptions-item>
        <a-descriptions-item :label="t('scheduledTask.result.prevMsgboardCount')">
          {{ parsedResult.prevMsgboardCount ?? '-' }}
        </a-descriptions-item>
        <a-descriptions-item :label="t('scheduledTask.result.emailSent')" :span="2">
          <a-tag :color="parsedResult.emailSent ? 'green' : 'orange'">
            {{
              parsedResult.emailSent
                ? t('scheduledTask.result.emailSent.yes')
                : t('scheduledTask.result.emailSent.no')
            }}
          </a-tag>
        </a-descriptions-item>
      </a-descriptions>
      <!-- 文章定时发布详情 -->
      <a-descriptions
        v-else-if="parsedResult && currentRecord?.taskName === 'scheduled_publish'"
        :column="1"
        bordered
        size="small"
      >
        <a-descriptions-item :label="t('scheduledTask.result.publishedCount')">
          <a-tag :color="parsedResult.publishedCount > 0 ? 'green' : 'orange'">
            {{ parsedResult.publishedCount ?? '-' }}
          </a-tag>
        </a-descriptions-item>
      </a-descriptions>
      <!-- 其他任务直接显示 JSON -->
      <pre
        v-else-if="parsedResult"
        style="background: #f5f5f5; padding: 12px; border-radius: 4px"
        >{{ JSON.stringify(parsedResult, null, 2) }}</pre
      >
      <a-empty v-else />
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import type { Pagination } from '@/types/global';
  import { IconSearch, IconRefresh, IconEye } from '@arco-design/web-vue/es/icon';
  import { getScheduledTaskList, getTaskList } from '@/api/scheduled-task';
  import useLoading from '@/hooks/loading';

  const { t } = useI18n();
  const { loading, setLoading } = useLoading(true);

  // 任务名称选项（从后端API获取任务定义）
  const taskOptions = ref<{ value: string; label: string }[]>([]);

  const loadTaskOptions = async () => {
    try {
      const res: any = await getTaskList();
      taskOptions.value = (res.data || []).map((item: any) => ({
        value: item.name,
        label: item.description || item.name,
      }));
    } catch {
      // ignore
    }
  };
  loadTaskOptions();

  /** 任务 name → 中文描述 的映射 */
  const taskNameMap = computed(() => {
    const map: Record<string, string> = {};
    for (const opt of taskOptions.value) {
      map[opt.value] = opt.label;
    }
    return map;
  });

  const generateFormModel = () => ({
    taskName: undefined as string | undefined,
    status: undefined as string | undefined,
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

  const parsedResult = computed(() => {
    if (!currentRecord.value?.result) return null;
    try {
      return JSON.parse(currentRecord.value.result);
    } catch {
      return null;
    }
  });

  const calcDuration = (start: string, end: string | null) => {
    if (!start || !end) return '-';
    const ms = new Date(end).getTime() - new Date(start).getTime();
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}min`;
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res: any = await getScheduledTaskList(formModel.value);
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
</script>

<script lang="ts">
  export default {
    name: 'ScheduledTaskTable',
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
