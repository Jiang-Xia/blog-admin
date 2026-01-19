<template>
  <div class="container">
    <!-- <Breadcrumb :items="['menu.list', 'menu.list.searchTable']" /> -->
    <a-card class="general-card" title="权限查询">
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
                <a-form-item label="权限名称">
                  <a-input v-model="formModel.privilegeName" placeholder="请输入权限名称" />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="路径模式">
                  <a-input v-model="formModel.pathPattern" placeholder="请输入路径模式" />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="HTTP方法">
                  <a-select v-model="formModel.httpMethod" placeholder="请选择HTTP方法" allow-clear>
                    <a-option value="GET">GET</a-option>
                    <a-option value="POST">POST</a-option>
                    <a-option value="PUT">PUT</a-option>
                    <a-option value="DELETE">DELETE</a-option>
                    <a-option value="PATCH">PATCH</a-option>
                    <a-option value="HEAD">HEAD</a-option>
                    <a-option value="OPTIONS">OPTIONS</a-option>
                    <a-option value="*">*(全部)</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item label="是否公开接口">
                  <a-select
                    v-model="formModel.isPublic"
                    placeholder="请选择是否公开接口"
                    allow-clear
                  >
                    <a-option :value="true">是</a-option>
                    <a-option :value="false">否</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="是否可见">
                  <a-select v-model="formModel.isVisible" placeholder="请选择是否可见" allow-clear>
                    <a-option :value="true">是</a-option>
                    <a-option :value="false">否</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8" style="text-align: right">
                <a-space :size="8">
                  <a-button type="primary" @click="search">
                    <template #icon>
                      <icon-search />
                    </template>
                    {{ '搜索' }}
                  </a-button>
                  <a-button @click="reset">
                    <template #icon>
                      <icon-refresh />
                    </template>
                    {{ '重置' }}
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
            <a-button type="primary" @click="showModal('add')">
              <template #icon>
                <icon-plus />
              </template>
              {{ '新建' }}
            </a-button>
          </a-space>
        </a-col>
      </a-row>

      <a-table
        :loading="loading"
        row-key="id"
        :pagination="pagination"
        :data="renderData"
        :bordered="false"
        @page-change="onPageChange"
      >
        <template #columns>
          <a-table-column
            min-width="130"
            title="权限名称"
            data-index="privilegeName"
            align="center"
          />
          <a-table-column
            min-width="130"
            title="权限识别码"
            data-index="privilegeCode"
            align="center"
          />
          <a-table-column
            min-width="130"
            title="所属页面"
            data-index="privilegePage"
            align="center"
          />
          <a-table-column
            min-width="130"
            title="路径模式"
            data-index="pathPattern"
            align="center"
          />
          <a-table-column min-width="180" title="HTTP方法" data-index="httpMethod" align="center" />
          <a-table-column min-width="100" title="是否公开接口" data-index="isPublic" align="center">
            <template #cell="{ record }">
              <a-tag :color="record.isPublic ? 'blue' : 'orange'">
                {{ record.isPublic ? '是' : '否' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column
            min-width="140"
            title="是否需要检查资源所有权"
            data-index="requireOwnership"
            align="center"
          >
            <template #cell="{ record }">
              <a-tag :color="record.requireOwnership ? 'purple' : 'gray'">
                {{ record.requireOwnership ? '是' : '否' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column min-width="100" title="是否可见" data-index="isVisible" align="center">
            <template #cell="{ record }">
              <a-tag :color="record.isVisible ? 'green' : 'red'">
                {{ record.isVisible ? '是' : '否' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column min-width="150" title="描述" data-index="description" align="center" />
          <a-table-column min-width="150" title="操作" data-index="operations" fixed="right">
            <template #cell="{ record }">
              <a-space :size="8">
                <a-button size="mini" type="primary" @click="showModal('edit', record.id)">
                  <icon-edit />
                </a-button>
                <a-button size="mini" type="primary" status="danger" @click="delHandle(record.id)">
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
  import { ref, reactive } from 'vue';
  import { useI18n } from 'vue-i18n';
  import useLoading from '@/hooks/loading';
  import type { Pagination } from '@/types/global';
  import { Message, Modal } from '@arco-design/web-vue';
  import { getAllPrivilege, delPrivilege } from '@/api/privilege';
  import addModal from './addPrivilege.vue';

  const generateFormModel = () => {
    return {
      page: 1,
      pageSize: 10,
      total: 0,
      privilegeName: '',
      pathPattern: '',
      httpMethod: '',
      isPublic: null,
      requireOwnership: null,
      isVisible: null,
    };
  };
  const { loading, setLoading } = useLoading(true);
  const { t } = useI18n();
  const renderData = ref([{}]);
  const formModel = ref<any>(generateFormModel());
  const basePagination: Pagination = {
    current: 1,
    pageSize: 10,
  };
  const pagination = reactive({
    ...basePagination,
  });
  const getTableListHandle = async (val = 1) => {
    setLoading(true);
    formModel.value.page = val;
    pagination.current = val;
    const res = await getAllPrivilege(formModel.value).then((res) => res.data);
    // console.log(res);
    renderData.value = res.list;
    pagination.total = res.pagination.total;
    setLoading(false);
  };
  const search = () => {
    pagination.current = 1;
    getTableListHandle();
  };
  const onPageChange = (current: number) => {
    getTableListHandle(current);
  };
  getTableListHandle();
  const reset = () => {
    formModel.value = generateFormModel();
  };
  const delHandle = async (id: any) => {
    Modal.confirm({
      title: '删除权限',
      content: '确定删除该权限嘛？',
      onOk: async () => {
        const res = await delPrivilege(id);
        Message.success('删除成功');
        getTableListHandle();
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
    name: 'PrivilegeManageTable',
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
