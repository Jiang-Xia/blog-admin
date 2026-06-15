<template>
  <div class="container">
    <a-card class="general-card" :title="t('taskManage.title')">
      <!-- 新增任务流程提示 -->
      <a-alert type="info" closable style="margin-bottom: 16px">
        <template #title>{{ t('taskManage.tip.title') }}</template>
        <template #default>
          <div>{{ t('taskManage.tip.step1') }}</div>
          <div>{{ t('taskManage.tip.step2') }}</div>
          <div>{{ t('taskManage.tip.step3') }}</div>
        </template>
      </a-alert>
      <!-- 工具栏 -->
      <a-row style="margin-bottom: 16px" :gutter="16">
        <a-col :flex="1">
          <a-form :model="queryParams" layout="inline">
            <a-form-item :label="t('taskManage.form.search')">
              <a-input
                v-model="queryParams.keyword"
                :placeholder="t('taskManage.form.placeholder.search')"
                allow-clear
                @press-enter="handleSearch"
              />
            </a-form-item>
            <a-form-item :label="t('taskManage.form.enabled')">
              <a-select
                v-model="queryParams.enabled"
                :placeholder="t('taskManage.form.placeholder.enabled')"
                allow-clear
                style="width: 120px"
              >
                <a-option value="true">{{ t('taskManage.status.enabled') }}</a-option>
                <a-option value="false">{{ t('taskManage.status.disabled') }}</a-option>
              </a-select>
            </a-form-item>
            <a-form-item>
              <a-space>
                <a-button type="primary" @click="handleSearch">
                  <template #icon><icon-search /></template>
                  {{ t('common.button.search') }}
                </a-button>
                <a-button @click="handleReset">
                  <template #icon><icon-refresh /></template>
                  {{ t('common.button.reset') }}
                </a-button>
              </a-space>
            </a-form-item>
          </a-form>
        </a-col>
        <a-col :span="8" style="text-align: right">
          <a-button type="primary" @click="handleAdd">
            <template #icon><icon-plus /></template>
            {{ t('taskManage.action.add') }}
          </a-button>
          <a-button @click="loadTaskList" style="margin-left: 8px">
            <template #icon><icon-refresh /></template>
          </a-button>
        </a-col>
      </a-row>

      <!-- 任务列表 -->
      <a-table
        :loading="loading"
        row-key="id"
        :pagination="false"
        :data="taskList"
        :bordered="false"
        scrollbar
        :scroll="{ x: 1100, y: 600 }"
      >
        <template #columns>
          <a-table-column :title="t('taskManage.table.name')" data-index="name" :width="180">
            <template #cell="{ record }">
              <a-tag color="arcoblue">
                {{ record.description || record.name }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column
            :title="t('taskManage.table.description')"
            data-index="description"
            :width="160"
          />
          <a-table-column :title="t('taskManage.table.cron')" :width="200">
            <template #cell="{ record }">
              <a-tag color="orangered" size="small">{{ record.cronHuman }}</a-tag>
              <span class="cron-expr">({{ record.cron }})</span>
            </template>
          </a-table-column>
          <a-table-column :title="t('taskManage.table.enabled')" :width="80" align="center">
            <template #cell="{ record }">
              <a-switch
                :model-value="record.enabled"
                size="small"
                @change="handleToggleEnabled(record)"
              />
            </template>
          </a-table-column>
          <a-table-column :title="t('taskManage.table.logRecording')" :width="90" align="center">
            <template #cell="{ record }">
              <a-switch
                :model-value="record.logRecording"
                size="small"
                @change="handleToggleLog(record)"
              />
            </template>
          </a-table-column>
          <a-table-column :title="t('taskManage.table.running')" :width="110" align="center">
            <template #cell="{ record }">
              <a-badge
                class="running-badge"
                :status="record.running ? 'processing' : 'default'"
                :text="
                  record.running ? t('taskManage.status.running') : t('taskManage.status.stopped')
                "
              />
            </template>
          </a-table-column>
          <a-table-column
            :title="t('taskManage.table.sortOrder')"
            data-index="sortOrder"
            :width="70"
            align="center"
          />
          <a-table-column :title="t('taskManage.table.actions')" :width="160" fixed="right">
            <template #cell="{ record }">
              <a-space :size="8">
                <a-button
                  size="mini"
                  type="primary"
                  @click="handleTrigger(record.name)"
                  :loading="triggerLoading[record.name]"
                >
                  <template #icon><icon-play-arrow /></template>
                </a-button>
                <a-button size="mini" type="primary" @click="handleEdit(record)">
                  <template #icon><icon-edit /></template>
                </a-button>
                <a-popconfirm
                  :content="t('taskManage.confirm.delete')"
                  @ok="handleDelete(record.id)"
                >
                  <a-button size="mini" type="primary" status="danger">
                    <template #icon><icon-delete /></template>
                  </a-button>
                </a-popconfirm>
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
      v-model:visible="formVisible"
      :title="isEdit ? t('taskManage.modal.editTitle') : t('taskManage.modal.addTitle')"
      :ok-loading="submitLoading"
      @ok="handleSubmit"
      @cancel="formVisible = false"
      :width="560"
    >
      <a-form :model="formData" :label-col-props="{ span: 6 }" :wrapper-col-props="{ span: 18 }">
        <a-form-item :label="t('taskManage.form.name')" :rules="[{ required: true }]">
          <a-input
            v-model="formData.name"
            :disabled="isEdit"
            :placeholder="t('taskManage.form.placeholder.name')"
          />
        </a-form-item>
        <a-form-item :label="t('taskManage.form.description')">
          <a-input
            v-model="formData.description"
            :placeholder="t('taskManage.form.placeholder.description')"
            allow-clear
          />
        </a-form-item>
        <a-form-item :label="t('taskManage.form.cron')" :rules="[{ required: true }]">
          <a-input v-model="formData.cron" placeholder="0 0 10 * * *" allow-clear />
        </a-form-item>
        <a-form-item :label="t('taskManage.form.cronHuman')">
          <a-input
            v-model="formData.cronHuman"
            :placeholder="t('taskManage.form.placeholder.cronHuman')"
            allow-clear
          />
        </a-form-item>
        <a-form-item :label="t('taskManage.form.enabled')">
          <a-switch v-model="formData.enabled" />
        </a-form-item>
        <a-form-item :label="t('taskManage.form.logRecording')">
          <a-switch v-model="formData.logRecording" />
        </a-form-item>
        <a-form-item :label="t('taskManage.form.sortOrder')"> </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, onMounted, onUnmounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { Message } from '@arco-design/web-vue';
  import type { Pagination } from '@/types/global';
  import {
    IconPlus,
    IconRefresh,
    IconSearch,
    IconPlayArrow,
    IconEdit,
    IconDelete,
  } from '@arco-design/web-vue/es/icon';
  import {
    getAllTasks,
    createTask,
    updateTask,
    deleteTask,
    triggerTask,
    stopTask,
    startTask,
    toggleLogRecording,
  } from '@/api/scheduled-task';
  import useLoading from '@/hooks/loading';

  const { t } = useI18n();
  const { loading, setLoading } = useLoading(false);

  const taskList = ref<any[]>([]);
  const triggerLoading = reactive<Record<string, boolean>>({});

  // 分页
  const basePagination: Pagination = { current: 1, pageSize: 20, total: 0 };
  const pagination = reactive({ ...basePagination });
  const queryParams = ref<{ page: number; pageSize: number; keyword?: string; enabled?: string }>({
    page: 1,
    pageSize: 20,
  });

  const handleSearch = () => {
    queryParams.value.page = 1;
    pagination.current = 1;
    loadTaskList();
  };

  const handleReset = () => {
    queryParams.value = { page: 1, pageSize: pagination.pageSize };
    pagination.current = 1;
    loadTaskList();
  };

  // 新增/编辑
  const formVisible = ref(false);
  const isEdit = ref(false);
  const submitLoading = ref(false);
  const editingId = ref<number | null>(null);

  const defaultFormData = () => ({
    name: '',
    description: '',
    cron: '',
    cronHuman: '',
    enabled: true,
    logRecording: true,
    sortOrder: 0,
  });
  const formData = ref(defaultFormData());

  const loadTaskList = async () => {
    setLoading(true);
    try {
      const res: any = await getAllTasks(queryParams.value);
      taskList.value = res.data?.list || [];
      pagination.total = res.data?.pagination?.total || 0;
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const onPageChange = (current: number) => {
    queryParams.value.page = current;
    pagination.current = current;
    loadTaskList();
  };

  const onPageSizeChange = (pageSize: number) => {
    queryParams.value.page = 1;
    queryParams.value.pageSize = pageSize;
    pagination.current = 1;
    pagination.pageSize = pageSize;
    loadTaskList();
  };

  const handleAdd = () => {
    isEdit.value = false;
    editingId.value = null;
    formData.value = defaultFormData();
    formVisible.value = true;
  };

  const handleEdit = (record: any) => {
    isEdit.value = true;
    editingId.value = record.id;
    formData.value = {
      name: record.name,
      description: record.description || '',
      cron: record.cron || '',
      cronHuman: record.cronHuman || '',
      enabled: record.enabled,
      logRecording: record.logRecording,
      sortOrder: record.sortOrder || 0,
    };
    formVisible.value = true;
  };

  const handleSubmit = async () => {
    submitLoading.value = true;
    try {
      if (isEdit.value && editingId.value) {
        const { name, ...data } = formData.value;
        await updateTask(editingId.value, data);
        Message.success(t('taskManage.message.updateSuccess'));
      } else {
        await createTask(formData.value);
        Message.success(t('taskManage.message.createSuccess'));
      }
      formVisible.value = false;
      await loadTaskList();
    } catch (e: any) {
      Message.error(e?.response?.data?.message || t('taskManage.message.operateFailed'));
    } finally {
      submitLoading.value = false;
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTask(id);
      Message.success(t('taskManage.message.deleteSuccess'));
      await loadTaskList();
    } catch (e: any) {
      Message.error(e?.response?.data?.message || t('taskManage.message.operateFailed'));
    }
  };

  const handleTrigger = async (taskName: string) => {
    triggerLoading[taskName] = true;
    try {
      await triggerTask(taskName);
      Message.success(t('taskManage.message.triggerSuccess'));
    } catch (e: any) {
      Message.error(e?.response?.data?.message || t('taskManage.message.triggerFailed'));
    } finally {
      triggerLoading[taskName] = false;
    }
  };

  const handleToggleEnabled = async (record: any) => {
    try {
      if (record.enabled) {
        await stopTask(record.name);
        Message.success(t('taskManage.message.stopSuccess'));
      } else {
        await startTask(record.name);
        Message.success(t('taskManage.message.startSuccess'));
      }
      await loadTaskList();
    } catch (e: any) {
      Message.error(e?.response?.data?.message || t('taskManage.message.operateFailed'));
    }
  };

  const handleToggleLog = async (record: any) => {
    try {
      const res: any = await toggleLogRecording(record.name);
      const enabled = res.data?.logRecording;
      Message.success(
        enabled ? t('taskManage.message.logRecordingOn') : t('taskManage.message.logRecordingOff'),
      );
      const task = taskList.value.find((t) => t.name === record.name);
      if (task) task.logRecording = enabled;
    } catch (e: any) {
      Message.error(e?.message || t('taskManage.message.logRecordingFailed'));
    }
  };

  /** 静默刷新（不显示 loading） */
  const silentRefresh = async () => {
    try {
      const res: any = await getAllTasks(queryParams.value);
      taskList.value = res.data?.list || [];
      pagination.total = res.data?.pagination?.total || 0;
    } catch {
      // 静默失败
    }
  };

  let refreshTimer: ReturnType<typeof setInterval> | null = null;

  onMounted(() => {
    loadTaskList();
    // 每 10 秒自动刷新任务状态
    refreshTimer = setInterval(silentRefresh, 10_000);
  });

  onUnmounted(() => {
    if (refreshTimer) {
      clearInterval(refreshTimer);
      refreshTimer = null;
    }
  });
</script>

<script lang="ts">
  export default {
    name: 'TaskManage',
  };
</script>

<style scoped lang="less">
  .container {
    padding: 20px;
  }

  .cron-expr {
    font-size: 12px;
    color: var(--color-text-4);
    margin-left: 4px;
  }

  .running-badge {
    white-space: nowrap;
  }

  :deep(.running-badge .arco-badge-status-text) {
    white-space: nowrap;
  }

  :deep(.arco-table-th) {
    &:last-child {
      .arco-table-th-item-title {
        margin-left: 16px;
      }
    }
  }
</style>
