<template>
  <div class="container">
    <!-- <Breadcrumb :items="['menu.list', 'menu.list.searchTable']" /> -->
    <a-card class="general-card" title="菜单查询">
      <a-row>
        <a-col :flex="1">
          <a-form
            :model="formModel"
            :label-col-props="{ span: 6 }"
            :wrapper-col-props="{ span: 18 }"
            label-align="left"
          >
            <a-row :gutter="16">
              <a-col :span="10">
                <a-form-item label="路由name">
                  <a-input v-model="formModel.content" placeholder="请输入路由name" disabled />
                </a-form-item>
              </a-col>
              <a-col :span="5" style="text-align: right">
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
          <a-table-column min-width="100" title="菜单id" data-index="id" />
          <a-table-column min-width="120" title="菜单英文名称" data-index="name" />
          <a-table-column min-width="120" title="菜单中文名称" data-index="menuCnName" />
          <a-table-column min-width="120" title="菜单路径" data-index="path" />
          <a-table-column min-width="120" title="菜单文件路径" data-index="filePath" />
          <a-table-column min-width="120" title="菜单图标" data-index="meta">
            <template #cell="{ record }">
              <DynamicIcon v-if="record?.meta?.icon" :icon="record?.meta?.icon" />
            </template>
          </a-table-column>
          <a-table-column min-width="120" title="菜单禁用状态" data-index="isDelete">
            <template #cell="{ record }">
              <a-switch
                v-model="record.isDelete"
                active-color="red"
                :checked-value="true"
                :unchecked-value="false"
                size="small"
                @change="onSwitchChange('isDelete', record)"
              >
                <template #checked-icon>
                  <icon-check />
                </template>
                <template #unchecked-icon>
                  <icon-lock />
                </template>
              </a-switch>
            </template>
          </a-table-column>
          <a-table-column min-width="100" title="操作" data-index="operations" fixed="right">
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
    <addMenu :ref="(el: any) => (addMenuRef = el)" @success="search"></addMenu>
  </div>
</template>

<script lang="ts" setup>
  import { reactive, ref, h, compile } from 'vue';
  import { useI18n } from 'vue-i18n';
  import useLoading from '@/hooks/loading';
  import type { Pagination } from '@/types/global';
  import { Message, Modal } from '@arco-design/web-vue';
  import request from '@/api/request';
  import addMenu from './addMenu.vue';
  // 函数式组件 https://vuejs.org/guide/extras/render-function.html#functional-components
  const DynamicIcon = (props: any, context: any) => {
    return h(compile(`<${props.icon}/>`), context.attrs, context.slots);
  };
  DynamicIcon.props = ['icon'];
  const generateFormModel = () => {
    return {
      page: 1,
      pageSize: 10,
      total: 0,
      content: '',
    };
  };
  const { loading, setLoading } = useLoading(true);
  const { t } = useI18n();
  const renderData = ref([{}]);
  const formModel = ref(generateFormModel());
  const addMenuRef = ref(addMenu);
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
    const res = await request.get('/admin/menu').then((res) => res.data);
    // console.log(res);
    renderData.value = res;
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
      title: '删除用户',
      content: '确定删除该用户嘛？',
      onOk: async () => {
        const res = await request.delete('/admin/menu', { params: { id } });
        Message.success('删除成功');
        getTableListHandle();
      },
    });
  };
  // 修改菜单
  const onSwitchChange = async (type: string, record: any) => {
    const { id } = record;
    const res = await request.patch(`/admin/menu`, {
      [type]: record[type],
      id,
    });
    Message.success('设置成功');
  };
  const showModal = (type: string, id?: string) => {
    // console.log(addMenuRef);
    // console.log(addMenuRef.value);
    addMenuRef.value.show({ type, id });
  };
</script>

<script lang="ts">
  export default {
    name: 'UserManageTable',
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
