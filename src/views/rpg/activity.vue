<template>
  <div class="container">
    <a-card class="general-card" title="活动/赛季管理">
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
                <a-form-item label="关键词">
                  <a-input
                    v-model="formModel.keyword"
                    placeholder="活动名称"
                    allow-clear
                    @press-enter="search"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="类型">
                  <a-select v-model="formModel.activityType" placeholder="请选择类型" allow-clear>
                    <a-option value="season">赛季</a-option>
                    <a-option value="event">活动</a-option>
                    <a-option value="festival">节日</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="状态">
                  <a-select v-model="formModel.active" allow-clear>
                    <a-option value="true">启用</a-option>
                    <a-option value="false">禁用</a-option>
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
              搜索
            </a-button>
            <a-button @click="reset">
              <template #icon><icon-refresh /></template>
              重置
            </a-button>
          </a-space>
        </a-col>
      </a-row>

      <a-divider style="margin-top: 0" />

      <a-row style="margin-bottom: 16px">
        <a-col :span="16">
          <a-button type="primary" @click="showCreateModal">
            <template #icon><icon-plus /></template>
            新增活动
          </a-button>
        </a-col>
      </a-row>

      <a-table
        row-key="id"
        :loading="loading"
        :data="tableData"
        :pagination="false"
        :bordered="false"
        scrollbar
        :scroll="{ x: 1100, y: 600 }"
      >
        <template #columns>
          <a-table-column title="编码" data-index="code" :width="140" />
          <a-table-column title="名称" data-index="name" :width="120" />
          <a-table-column title="类型" data-index="activityType" :width="90">
            <template #cell="{ record }">
              <a-tag>{{ activityTypeLabel(record.activityType) }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="经验加成" data-index="expBuffRate" :width="90" align="center" />
          <a-table-column title="开始" data-index="startTime" :width="170">
            <template #cell="{ record }">
              {{ record.startTime ? $dayjs(record.startTime).format('YYYY-MM-DD HH:mm:ss') : '-' }}
            </template>
          </a-table-column>
          <a-table-column title="结束" data-index="endTime" :width="170">
            <template #cell="{ record }">
              {{ record.endTime ? $dayjs(record.endTime).format('YYYY-MM-DD HH:mm:ss') : '-' }}
            </template>
          </a-table-column>
          <a-table-column title="状态" data-index="active" :width="80">
            <template #cell="{ record }">
              <a-tag :color="record.active ? 'green' : 'red'">
                {{ record.active ? '启用' : '禁用' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="120" fixed="right">
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
    <a-modal
      v-model:visible="modalVisible"
      :title="isEdit ? '编辑活动' : '新增活动'"
      :width="720"
      @ok="handleModalOk"
      @cancel="modalVisible = false"
    >
      <a-form :model="modalForm" :label-col-props="{ span: 7 }" :wrapper-col-props="{ span: 17 }">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="编码" required>
              <a-input v-model="modalForm.code" :disabled="isEdit" placeholder="唯一编码" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="名称" required>
              <a-input v-model="modalForm.name" placeholder="活动名称" allow-clear />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="描述">
              <a-input v-model="modalForm.description" placeholder="活动描述" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="类型">
              <a-select v-model="modalForm.activityType">
                <a-option value="season">赛季</a-option>
                <a-option value="event">活动</a-option>
                <a-option value="festival">节日</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="开始时间">
              <a-date-picker v-model="modalForm.startTime" show-time style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="结束时间">
              <a-date-picker v-model="modalForm.endTime" show-time style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="经验加成">
              <a-input-number
                v-model="modalForm.expBuffRate"
                :min="1"
                :step="0.1"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="海报URL">
              <a-input
                v-model="modalForm.posterUrl"
                placeholder="/images/rpg/poster.png"
                allow-clear
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="状态">
              <a-radio-group v-model="modalForm.active">
                <a-radio :value="true">启用</a-radio>
                <a-radio :value="false">禁用</a-radio>
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
  import { Message, Modal } from '@arco-design/web-vue';
  import {
    IconEdit,
    IconDelete,
    IconPlus,
    IconSearch,
    IconRefresh,
  } from '@arco-design/web-vue/es/icon';
  import type { Pagination } from '@/types/global';
  import { getActivityList, createActivity, updateActivity, deleteActivity } from '@/api/rpg';
  import useLoading from '@/hooks/loading';

  const ACTIVITY_TYPE_LABELS: Record<string, string> = {
    season: '赛季',
    event: '活动',
    festival: '节日',
  };
  const activityTypeLabel = (type: string) => ACTIVITY_TYPE_LABELS[type] || type;

  const generateFormModel = () => ({
    keyword: '',
    activityType: undefined as string | undefined,
    active: undefined as string | undefined,
    page: 1,
    pageSize: 20,
  });

  const { loading, setLoading } = useLoading(true);
  const formModel = ref(generateFormModel());
  const tableData = ref<any[]>([]);
  const basePagination: Pagination = { current: 1, pageSize: 20, total: 0 };
  const pagination = reactive({ ...basePagination });
  const modalVisible = ref(false);
  const isEdit = ref(false);
  const editId = ref(0);
  const defaultModalForm = {
    code: '',
    name: '',
    description: '',
    activityType: 'event',
    startTime: '',
    endTime: '',
    expBuffRate: 1.2,
    posterUrl: '',
    active: true,
  };
  const modalForm = ref({ ...defaultModalForm });

  const loadData = async () => {
    setLoading(true);
    try {
      const res: any = await getActivityList(formModel.value);
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
    modalForm.value = { ...defaultModalForm };
    modalVisible.value = true;
  };
  const showEditModal = (record: any) => {
    isEdit.value = true;
    editId.value = record.id;
    modalForm.value = { ...defaultModalForm, ...record, active: record.active !== false };
    modalVisible.value = true;
  };

  const handleModalOk = async () => {
    if (!modalForm.value.code || !modalForm.value.name) {
      Message.warning('编码和名称不能为空');
      return;
    }
    if (isEdit.value) {
      const { code, ...data } = modalForm.value;
      await updateActivity(editId.value, data);
      Message.success('更新成功');
    } else {
      await createActivity(modalForm.value);
      Message.success('创建成功');
    }
    modalVisible.value = false;
    loadData();
  };

  const handleDelete = (record: any) => {
    Modal.confirm({
      title: '删除活动',
      content: `确定删除 ${record.name} 吗？`,
      onOk: async () => {
        await deleteActivity(record.id);
        Message.success('删除成功');
        loadData();
      },
    });
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
</style>
