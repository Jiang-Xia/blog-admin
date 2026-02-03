<template>
  <div class="container">
    <!-- <Breadcrumb :items="['menu.list', 'menu.list.searchTable']" /> -->
    <a-card class="general-card" :title="t('role.query.title')">
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
                <a-form-item :label="t('role.form.name')">
                  <a-input
                    v-model="formModel.roleName"
                    :placeholder="t('role.form.placeholder.name')"
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
            <a-button v-permission="'role:create'" type="primary" @click="showModal('add')">
              <template #icon>
                <icon-plus />
              </template>
              {{ t('role.button.create') }}
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
          <a-table-column :title="t('system.table.roleId')" data-index="id" align="center" />
          <a-table-column
            :title="t('system.table.roleName')"
            data-index="roleName"
            align="center"
          />
          <a-table-column :title="t('system.table.roleDesc')" data-index="roleDesc" />
          <a-table-column :title="t('role.table.operation')" data-index="operations">
            <template #cell="{ record }">
              <a-space :size="8">
                <a-button
                  v-permission="'role:update'"
                  size="mini"
                  type="primary"
                  @click="showModal('edit', record.id)"
                >
                  <icon-edit />
                </a-button>
                <a-button
                  v-permission="'role:delete'"
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
  import { ref, reactive } from 'vue';
  import { useI18n } from 'vue-i18n';
  import useLoading from '@/hooks/loading';
  import type { Pagination } from '@/types/global';
  import { Message, Modal } from '@arco-design/web-vue';
  import { getAllRole, delRole } from '@/api/role';
  import addModal from './addRole.vue';

  const generateFormModel = () => {
    return {
      page: 1,
      pageSize: 10,
      total: 0,
      roleName: '',
    };
  };
  const { loading, setLoading } = useLoading(true);
  const { t } = useI18n();
  const renderData = ref([{}]);
  const formModel = ref(generateFormModel());
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
    const res = await getAllRole(formModel.value).then((res) => res.data);
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
      title: t('role.confirm.delete'),
      content: t('role.confirm.delete'),
      onOk: async () => {
        const res = await delRole(id);
        Message.success(t('role.message.deleteSuccess'));
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
    name: 'RoleManageTable',
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
