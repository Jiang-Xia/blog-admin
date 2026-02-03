<template>
  <div class="container">
    <!-- <Breadcrumb :items="['menu.list', 'menu.list.searchTable']" /> -->
    <a-card class="general-card" :title="t('dept.query.title')">
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
                <a-form-item :label="t('dept.form.name')">
                  <a-input
                    v-model="formModel.deptName"
                    :placeholder="t('dept.form.placeholder.name')"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item :label="t('common.form.status')">
                  <a-select
                    v-model="formModel.status"
                    :placeholder="t('common.form.placeholder.select')"
                    allow-clear
                  >
                    <a-option :value="1">{{ t('common.status.normal') }}</a-option>
                    <a-option :value="0">{{ t('common.status.disable') }}</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row style="margin-top: 16px">
              <a-col :span="24" style="text-align: right">
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
          </a-form>
        </a-col>
      </a-row>

      <a-row style="margin-bottom: 16px">
        <a-col :span="16">
          <a-space>
            <a-button v-permission="'dept:create'" type="primary" @click="showModal('add')">
              <template #icon>
                <icon-plus />
              </template>
              {{ t('dept.button.create') }}
            </a-button>
            <a-button @click="toggleViewMode">
              <template #icon>
                <icon-apps v-if="viewMode === 'table'" />
                <icon-list v-if="viewMode === 'tree'" />
              </template>
              {{ viewMode === 'table' ? t('dept.view.tree') : t('dept.view.table') }}
            </a-button>
          </a-space>
        </a-col>
      </a-row>

      <!-- 树形视图 -->
      <div v-if="viewMode === 'tree'">
        <a-tree
          v-model:expandedKeys="expandedKeys"
          block-node
          :data="treeData"
          :field-names="{ key: 'id', title: 'deptName', children: 'children' }"
          :default-expand-all="true"
        >
          <template #title="nodeData">
            <span class="tree-node-title">
              <span class="node-name">{{ nodeData.deptName }}</span>
              <span class="node-info">
                ({{ t('dept.tree.code') }}: {{ nodeData.deptCode || '-' }},
                {{ t('dept.tree.leader') }}: {{ nodeData.leaderName || '-' }})
              </span>
              <a-space class="node-actions">
                <a-button
                  v-permission="'dept:update'"
                  size="mini"
                  type="primary"
                  @click="showModal('edit', nodeData.id)"
                >
                  <icon-edit />
                </a-button>
                <a-button
                  v-permission="'dept:delete'"
                  size="mini"
                  type="primary"
                  status="danger"
                  @click="delHandle(nodeData.id)"
                >
                  <icon-delete />
                </a-button>
              </a-space>
            </span>
          </template>
        </a-tree>
      </div>

      <!-- 树形表格视图 -->
      <a-table
        v-else
        :loading="loading"
        row-key="id"
        :data="treeTableData"
        :bordered="false"
        :columns="tableColumns"
        :pagination="false"
        :row-class-name="getRowClassName"
        class="dept-tree-table"
      >
        <template #columns>
          <a-table-column v-for="column in tableColumns" :key="column.dataIndex" v-bind="column">
            <template #cell="{ record }">
              <template v-if="column.dataIndex === 'deptName'">
                <span :style="{ paddingLeft: `${record.level * 24}px`, display: 'inline-block' }">
                  {{ record.deptName }}
                </span>
              </template>
              <template v-else-if="column.dataIndex === 'status'">
                <a-tag :color="record.status === 1 ? 'green' : 'red'">
                  {{ record.status === 1 ? t('common.status.normal') : t('common.status.disable') }}
                </a-tag>
              </template>
              <template v-else-if="column.dataIndex === 'operations'">
                <a-space :size="8">
                  <a-button
                    v-permission="'dept:update'"
                    size="mini"
                    type="primary"
                    @click="showModal('edit', record.id)"
                  >
                    <icon-edit />
                  </a-button>
                  <a-button
                    v-permission="'dept:delete'"
                    size="mini"
                    type="primary"
                    status="danger"
                    @click="delHandle(record.id)"
                  >
                    <icon-delete />
                  </a-button>
                </a-space>
              </template>
              <template v-else>
                {{ record[column.dataIndex] }}
              </template>
            </template>
          </a-table-column>
          <a-table-column :title="t('dept.table.operation')">
            <template #cell="{ record }">
              <a-space :size="8">
                <a-button
                  v-permission="'dept:update'"
                  size="mini"
                  type="primary"
                  @click="showModal('edit', record.id)"
                >
                  <icon-edit />
                </a-button>
                <a-button
                  v-permission="'dept:delete'"
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
    </a-card>
    <add-modal ref="addRef" @success="search"></add-modal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, computed, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import useLoading from '@/hooks/loading';
  import type { Pagination } from '@/types/global';
  import { Message, Modal } from '@arco-design/web-vue';
  import request from '@/api/request';
  import { getAllDept, delDept, getDeptTree } from '@/api/dept';
  import addModal from './addDept.vue';

  const generateFormModel = () => {
    return {
      page: 1,
      pageSize: 99999,
      total: 0,
      deptName: '',
      status: undefined,
    };
  };
  const { loading, setLoading } = useLoading(true);
  const { t } = useI18n();
  const renderData = ref([{}]);
  const treeData = ref([]);
  const treeTableData = ref<any[]>([]);
  const expandedKeys = ref([]);
  const viewMode = ref('table'); // 'table' 或 'tree'
  const formModel = ref(generateFormModel());
  const basePagination: Pagination = {
    current: 1,
    pageSize: 10,
  };
  const pagination = reactive({
    ...basePagination,
  });

  // 表格列定义
  const tableColumns = [
    {
      title: t('dept.table.name'),
      dataIndex: 'deptName',
      align: 'center',
    },
    {
      title: t('dept.table.code'),
      dataIndex: 'deptCode',
    },
    {
      title: t('dept.form.parentId'),
      dataIndex: 'parentId',
    },
    {
      title: t('dept.table.leader'),
      dataIndex: 'leaderName',
    },
    {
      title: t('dept.table.sort'),
      dataIndex: 'orderNum',
    },
    {
      title: t('dept.table.status'),
      dataIndex: 'status',
    },
    {
      title: t('dept.form.description'),
      dataIndex: 'remark',
    },
  ];
  const getTableListHandle = async (val = 1) => {
    getTreeDataHandle();
  };

  // 获取树形数据
  const getTreeDataHandle = async () => {
    try {
      setLoading(true);
      const res = await getDeptTree();
      treeData.value = res.data || [];
      treeTableData.value = res.data;
      setLoading(false);
    } catch (error) {
      console.error('获取部门树失败:', error);
      Message.error(t('dept.message.deleteFail'));
      setLoading(false);
    }
  };

  // 切换视图模式
  const toggleViewMode = () => {
    viewMode.value = viewMode.value === 'table' ? 'tree' : 'table';
    if (viewMode.value === 'tree') {
      getTreeDataHandle();
    } else {
      getTableListHandle();
    }
  };
  const search = () => {
    pagination.current = 1;
    getTableListHandle();
  };
  const onPageChange = (current: number) => {
    getTableListHandle(current);
  };
  getTableListHandle();

  // 初始化树形数据
  getTreeDataHandle();

  const reset = () => {
    formModel.value = generateFormModel();
    search();
  };

  // 获取表格行类名
  const getRowClassName = (record: any) => {
    return `level-${record.level}`;
  };

  // 监听视图模式变化，切换时加载对应数据
  watch(viewMode, (newMode: string) => {
    if (newMode === 'table') {
      getTableListHandle();
    } else {
      getTreeDataHandle();
    }
  });
  const delHandle = async (id: any) => {
    Modal.confirm({
      title: t('dept.confirm.delete'),
      content: t('dept.confirm.delete'),
      onOk: async () => {
        const res = await delDept(id);
        Message.success(t('dept.message.deleteSuccess'));
        // 根据当前视图模式刷新数据
        if (viewMode.value === 'table') {
          getTableListHandle();
        } else {
          getTreeDataHandle();
        }
      },
    });
  };
  const addRef = ref(addModal);
  const showModal = (type: string, id?: string) => {
    addRef.value.show({ type, id });
  };
</script>

<script lang="ts">
  export default {
    name: 'DeptManageTable',
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

  .tree-node-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding-right: 12px;
  }

  .node-name {
    font-weight: 500;
  }

  .node-info {
    color: #888;
    font-size: 12px;
    margin-left: 8px;
  }

  .node-actions {
    margin-left: auto;
    opacity: 0;
    transition: opacity 0.2s;
  }

  :deep(.arco-tree-node-title:hover) .node-actions {
    opacity: 1;
  }

  .dept-tree-table {
    :deep(.arco-table-tr) {
      &.level-0 {
        background-color: #f9f9f9;
      }
      &.level-1 {
        background-color: #fdfdfd;
      }
    }
  }
</style>
