<template>
  <div class="container">
    <a-card class="general-card" title="成就管理">
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
                    placeholder="请输入成就名称"
                    allow-clear
                    @press-enter="search"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="分类">
                  <a-select v-model="formModel.category" placeholder="请选择分类" allow-clear>
                    <a-option value="creation">创作</a-option>
                    <a-option value="social">社交</a-option>
                    <a-option value="exploration">探索</a-option>
                    <a-option value="sign">签到</a-option>
                    <a-option value="special">特殊</a-option>
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
          <a-space>
            <a-button type="primary" @click="showCreateModal">
              <template #icon><icon-plus /></template>
              新增成就
            </a-button>
          </a-space>
        </a-col>
      </a-row>

      <a-table
        :loading="loading"
        row-key="id"
        :pagination="false"
        :data="tableData"
        :bordered="false"
        scrollbar
        :scroll="{ x: 1200, y: 600 }"
      >
        <template #columns>
          <a-table-column title="编码" data-index="code" :width="140" />
          <a-table-column title="名称" data-index="name" :width="120" />
          <a-table-column title="描述" data-index="description" :width="160" ellipsis tooltip />
          <a-table-column title="分类" data-index="category" :width="90">
            <template #cell="{ record }">
              <a-tag>{{ categoryLabel(record.category) }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="图标" data-index="icon" :width="110" />
          <a-table-column title="达成条件" data-index="maxProgress" :width="90" align="center" />
          <a-table-column title="经验奖励" data-index="expReward" :width="90" align="center">
            <template #cell="{ record }">
              <span style="color: #f59e0b; font-weight: 600">+{{ record.expReward }}</span>
            </template>
          </a-table-column>
          <a-table-column title="隐藏" data-index="isHidden" :width="60">
            <template #cell="{ record }">{{ record.isHidden ? '是' : '否' }}</template>
          </a-table-column>
          <a-table-column title="排序" data-index="sort" :width="60" align="center" />
          <a-table-column title="状态" data-index="active" :width="80">
            <template #cell="{ record }">
              <a-tag :color="record.active !== false ? 'green' : 'red'">
                {{ record.active !== false ? '启用' : '禁用' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="操作" data-index="operations" :width="120" fixed="right">
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
      :title="isEdit ? '编辑成就' : '新增成就'"
      :width="720"
      @ok="handleModalOk"
      @cancel="modalVisible = false"
    >
      <a-form :model="modalForm" :label-col-props="{ span: 7 }" :wrapper-col-props="{ span: 17 }">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="编码" required>
              <a-input
                v-model="modalForm.code"
                placeholder="唯一编码，如 first_article"
                :disabled="isEdit"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="名称" required>
              <a-input v-model="modalForm.name" placeholder="成就显示名称" allow-clear />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="描述">
              <a-input v-model="modalForm.description" placeholder="成就描述" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="分类">
              <a-select v-model="modalForm.category">
                <a-option value="creation">创作</a-option>
                <a-option value="social">社交</a-option>
                <a-option value="exploration">探索</a-option>
                <a-option value="sign">签到</a-option>
                <a-option value="special">特殊</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="图标">
              <a-input v-model="modalForm.icon" placeholder="图标ID" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="达成次数"> </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="经验奖励"> </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="排序"> </a-form-item>
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
          <a-col :span="12">
            <a-form-item label="隐藏成就">
              <a-radio-group v-model="modalForm.isHidden">
                <a-radio :value="1">是</a-radio>
                <a-radio :value="0">否</a-radio>
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

  const CATEGORY_LABELS: Record<string, string> = {
    creation: '创作',
    social: '社交',
    exploration: '探索',
    sign: '签到',
    special: '特殊',
  };
  const categoryLabel = (category: string) => CATEGORY_LABELS[category] || category;

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
    isHidden: 0,
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
      isHidden: record.isHidden ?? 0,
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
      Message.success('更新成功');
    } else {
      await createAchievement(modalForm.value);
      Message.success('新增成功');
    }
    modalVisible.value = false;
    loadData();
  };

  const handleDelete = (record: any) => {
    Modal.confirm({
      title: '删除成就',
      content: '确定删除该成就吗？删除后不可恢复。',
      onOk: async () => {
        await deleteAchievement(record.id);
        Message.success('删除成功');
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
