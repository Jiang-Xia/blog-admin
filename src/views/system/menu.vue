<template>
  <div class="container">
    <!-- <Breadcrumb :items="['menu.list', 'menu.list.searchTable']" /> -->
    <a-card class="general-card" :title="t('menu.query.title')">
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
                <a-form-item :label="t('system.form.routeName')">
                  <a-input
                    v-model="formModel.content"
                    :placeholder="t('system.form.placeholder.routeName')"
                    disabled
                  />
                </a-form-item>
              </a-col>
              <a-col :span="5" style="text-align: right">
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
            <a-button type="primary" @click="showModal('add')">
              <template #icon>
                <icon-plus />
              </template>
              {{ t('menu.button.create') }}
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
          <a-table-column min-width="100" :title="t('system.table.menuId')" data-index="id" />
          <a-table-column min-width="120" :title="t('system.table.menuEnName')" data-index="name" />
          <a-table-column
            min-width="120"
            :title="t('system.table.menuCnName')"
            data-index="menuCnName"
          />
          <a-table-column min-width="120" :title="t('system.table.menuPath')" data-index="path" />
          <a-table-column
            min-width="120"
            :title="t('system.table.menuFilePath')"
            data-index="filePath"
          />
          <a-table-column min-width="120" :title="t('system.table.menuIcon')" data-index="meta">
            <template #cell="{ record }">
              <DynamicIcon v-if="record?.meta?.icon" :icon="record?.meta?.icon" />
            </template>
          </a-table-column>
          <a-table-column
            min-width="120"
            :title="t('system.table.menuDisabled')"
            data-index="isDelete"
          >
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
          <a-table-column
            min-width="100"
            :title="t('menu.table.operation')"
            data-index="operations"
            fixed="right"
          >
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
      title: t('menu.confirm.delete'),
      content: t('menu.confirm.delete'),
      onOk: async () => {
        const res = await request.delete('/admin/menu', { params: { id } });
        Message.success(t('menu.message.deleteSuccess'));
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
    Message.success(t('common.message.setSuccess'));
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
