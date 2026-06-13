<template>
  <div class="container">
    <a-card class="general-card" title="系统物品管理">
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
                    placeholder="物品名称"
                    @press-enter="search"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="类型">
                  <a-select v-model="formModel.itemType" allow-clear placeholder="全部类型">
                    <a-option value="title">称号</a-option>
                    <a-option value="avatar_frame">头像框</a-option>
                    <a-option value="pet">宠物</a-option>
                    <a-option value="consumable">消耗品</a-option>
                    <a-option value="buff">Buff</a-option>
                    <a-option value="achievement">成就</a-option>
                    <a-option value="equipment">装备</a-option>
                    <a-option value="fragment">钻石</a-option>
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
            新增物品
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
        :scroll="{ x: 900, y: 600 }"
      >
        <template #columns>
          <a-table-column title="编码" data-index="code" :width="140" />
          <a-table-column title="名称" data-index="name" :width="120" />
          <a-table-column title="类型" data-index="itemType" :width="100">
            <template #cell="{ record }">
              <a-tag>{{ itemTypeLabel(record.itemType) }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="稀有度" data-index="rarity" :width="90">
            <template #cell="{ record }">
              <a-tag :color="rarityColor(record.rarity)">
                {{ rarityLabel(record.rarity) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="排序" data-index="sort" :width="70" align="center" />
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
      :title="isEdit ? '编辑物品' : '新增物品'"
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
              <a-input v-model="modalForm.name" placeholder="物品名称" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="描述">
              <a-input v-model="modalForm.description" placeholder="物品描述" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="类型">
              <a-select v-model="modalForm.itemType">
                <a-option value="title">称号</a-option>
                <a-option value="avatar_frame">头像框</a-option>
                <a-option value="pet">宠物</a-option>
                <a-option value="consumable">消耗品</a-option>
                <a-option value="buff">Buff</a-option>
                <a-option value="achievement">成就</a-option>
                <a-option value="equipment">装备</a-option>
                <a-option value="fragment">碎片</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="稀有度">
              <a-select v-model="modalForm.rarity">
                <a-option value="common">普通</a-option>
                <a-option value="rare">稀有</a-option>
                <a-option value="epic">史诗</a-option>
                <a-option value="legendary">传说</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="排序">
              <a-input-number v-model="modalForm.sort" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="图标">
              <a-input v-model="modalForm.icon" placeholder="图标ID" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="分类">
              <a-input v-model="modalForm.category" placeholder="可选分类" />
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
  import {
    getItemConfigList,
    createItemConfig,
    updateItemConfig,
    deleteItemConfig,
  } from '@/api/rpg';
  import useLoading from '@/hooks/loading';

  const ITEM_TYPE_LABELS: Record<string, string> = {
    title: '称号',
    avatar_frame: '头像框',
    pet: '宠物',
    equipment: '装备',
    achievement: '成就',
    buff: '增益',
    fragment: '钻石',
    consumable: '消耗品',
  };

  const RARITY_LABELS: Record<string, string> = {
    common: '普通',
    rare: '稀有',
    epic: '史诗',
    legendary: '传说',
  };

  const itemTypeLabel = (type: string) => ITEM_TYPE_LABELS[type] || type;
  const rarityLabel = (rarity: string) => RARITY_LABELS[rarity] || rarity;
  const rarityColor = (rarity: string) => {
    const map: Record<string, string> = {
      common: 'gray',
      rare: 'blue',
      epic: 'purple',
      legendary: 'orangered',
    };
    return map[rarity] || 'gray';
  };

  const { loading, setLoading } = useLoading(true);
  const formModel = ref({
    keyword: '',
    itemType: undefined as string | undefined,
    page: 1,
    pageSize: 20,
  });
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
    itemType: 'title',
    category: '',
    icon: 'default',
    rarity: 'common',
    sort: 10,
    active: true,
  };
  const modalForm = ref({ ...defaultModalForm });

  const loadData = async () => {
    setLoading(true);
    try {
      const res: any = await getItemConfigList(formModel.value);
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
    formModel.value = { keyword: '', itemType: undefined, page: 1, pageSize: 20 };
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
      await updateItemConfig(editId.value, data);
      Message.success('更新成功');
    } else {
      await createItemConfig(modalForm.value);
      Message.success('创建成功');
    }
    modalVisible.value = false;
    loadData();
  };

  const handleDelete = (record: any) => {
    Modal.confirm({
      title: '删除物品',
      content: `确定删除 ${record.name} 吗？`,
      onOk: async () => {
        await deleteItemConfig(record.id);
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
