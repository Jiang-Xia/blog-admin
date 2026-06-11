<template>
  <div class="container">
    <a-card class="general-card" title="活动/赛季管理">
      <a-button type="primary" style="margin-bottom: 16px" @click="showCreateModal">
        <icon-plus />新增活动
      </a-button>
      <a-table
        row-key="id"
        :loading="loading"
        :data="tableData"
        :pagination="pagination"
        @page-change="onPageChange"
      >
        <template #columns>
          <a-table-column title="编码" data-index="code" />
          <a-table-column title="名称" data-index="name" />
          <a-table-column title="类型" data-index="activityType" />
          <a-table-column title="经验加成" data-index="expBuffRate" />
          <a-table-column title="开始" data-index="startTime" />
          <a-table-column title="结束" data-index="endTime" />
          <a-table-column title="状态" data-index="active">
            <template #cell="{ record }">{{ record.active ? '启用' : '禁用' }}</template>
          </a-table-column>
          <a-table-column title="操作">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="showEditModal(record)"
                  ><icon-edit
                /></a-button>
                <a-button type="text" size="small" status="danger" @click="handleDelete(record)"
                  ><icon-delete
                /></a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
    <a-modal
      v-model:visible="modalVisible"
      :title="isEdit ? '编辑活动' : '新增活动'"
      width="640px"
      @ok="handleModalOk"
    >
      <a-form :model="modalForm" layout="vertical">
        <a-form-item label="编码" required
          ><a-input v-model="modalForm.code" :disabled="isEdit"
        /></a-form-item>
        <a-form-item label="名称" required><a-input v-model="modalForm.name" /></a-form-item>
        <a-form-item label="描述"><a-textarea v-model="modalForm.description" /></a-form-item>
        <a-form-item label="类型">
          <a-select v-model="modalForm.activityType">
            <a-option value="season">赛季</a-option>
            <a-option value="event">活动</a-option>
            <a-option value="festival">节日</a-option>
          </a-select>
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="开始时间"
              ><a-date-picker v-model="modalForm.startTime" show-time style="width: 100%"
            /></a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="结束时间"
              ><a-date-picker v-model="modalForm.endTime" show-time style="width: 100%"
            /></a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="经验加成倍率"
          ><a-input-number v-model="modalForm.expBuffRate" :min="1" :step="0.1"
        /></a-form-item>
        <a-form-item label="状态">
          <a-radio-group v-model="modalForm.active">
            <a-radio :value="true">启用</a-radio>
            <a-radio :value="false">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import { Message, Modal } from '@arco-design/web-vue';
  import { IconEdit, IconDelete, IconPlus } from '@arco-design/web-vue/es/icon';
  import type { Pagination } from '@/types/global';
  import { getActivityList, createActivity, updateActivity, deleteActivity } from '@/api/rpg';
  import useLoading from '@/hooks/loading';

  const { loading, setLoading } = useLoading(true);
  const formModel = ref({ page: 1, pageSize: 20 });
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
