<template>
  <div class="container">
    <!-- <Breadcrumb :items="['menu.list', 'menu.list.searchTable']" /> -->
    <a-card class="general-card" :title="t('user.query.title')">
      <a-row>
        <a-col :flex="1">
          <a-form
            :model="formModel"
            :label-col-props="{ span: 6 }"
            :wrapper-col-props="{ span: 18 }"
            label-align="left"
          >
            <a-row :gutter="16">
              <a-col :span="6">
                <a-form-item :label="t('user.form.mobile')">
                  <a-input
                    v-model="formModel.mobile"
                    :placeholder="t('user.form.placeholder.mobile')"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item :label="t('user.form.username')">
                  <a-input
                    v-model="formModel.username"
                    :placeholder="t('user.form.placeholder.username')"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item :label="t('user.form.nickname')">
                  <a-input
                    v-model="formModel.nickname"
                    :placeholder="t('user.form.placeholder.nickname')"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="4" style="text-align: right">
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
            <a-button v-permission="'user:create'" type="primary" @click="showModal('add')">
              <template #icon>
                <icon-plus />
              </template>
              {{ t('common.button.create') }}
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
          <a-table-column :title="t('user.table.mobile')" data-index="mobile" align="center" />
          <a-table-column :title="t('system.table.avatar')" data-index="url" align="center">
            <template #cell="{ record }">
              <a-avatar>
                <img :alt="record.avatar" :src="record.avatar" />
              </a-avatar>
            </template>
          </a-table-column>
          <a-table-column :title="t('user.table.username')" data-index="username" align="center" />
          <a-table-column :title="t('user.table.nickname')" data-index="nickname" />
          <a-table-column :title="t('system.table.roleType')" data-index="role" />
          <a-table-column
            :title="t('user.table.createTime')"
            data-index="createTime"
            align="center"
          >
            <template #cell="{ record }">
              {{ formatDate(record.createTime) }}
            </template>
          </a-table-column>
          <a-table-column
            :title="t('system.table.updateTime')"
            data-index="updateTime"
            align="center"
          >
            <template #cell="{ record }">
              {{ formatDate(record.updateTime) }}
            </template>
          </a-table-column>
          <a-table-column :title="t('system.table.locked')" data-index="status">
            <template #cell="{ record }">
              <!-- :disabled="record.agreed" -->
              <a-switch
                v-permission="'user:status'"
                v-model="record.status"
                active-color="red"
                checked-value="locked"
                unchecked-value="active"
                :disabled="record.role === 'super'"
                @change="onSwitchStatus(record)"
              >
                <template #checked-icon>
                  <icon-lock />
                </template>
                <template #unchecked-icon>
                  <icon-unlock />
                </template>
              </a-switch>
            </template>
          </a-table-column>
          <a-table-column :title="t('user.table.operation')" data-index="operations">
            <template #cell="{ record }">
              <a-space :size="8">
                <a-button
                  v-permission="'user:delete'"
                  size="mini"
                  type="primary"
                  status="danger"
                  @click="delHandle(record.id)"
                >
                  <icon-delete />
                </a-button>
                <a-button
                  v-permission="'user:edit'"
                  size="mini"
                  type="primary"
                  :disabled="record.role === 'super'"
                  @click="showModal('edit', record.id)"
                >
                  {{ t('user.button.edit') }}
                  <icon-edit />
                </a-button>
                <a-button
                  v-permission="'user:resetPassword'"
                  size="mini"
                  type="primary"
                  :disabled="record.role === 'super'"
                  @click="resetHandle(record)"
                >
                  {{ t('user.button.resetPassword') }}
                  <icon-refresh />
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
  import request from '@/api/request';
  import dayjs from 'dayjs';
  import addModal from './addUser.vue';

  const generateFormModel = () => {
    return {
      page: 1,
      pageSize: 10,
      total: 0,
      mobile: '',
      nickname: '',
      username: '',
    };
  };
  const { loading, setLoading } = useLoading(true);
  const { t } = useI18n();
  interface User {
    id: string;
    mobile: string;
    username: string;
    nickname: string;
    avatar: string;
    role: string;
    status: string;
    createTime?: string;
    updateTime?: string;
  }

  const renderData = ref<User[]>([]);
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
    const res = await request.post('/user/list', formModel.value).then((res) => res.data);
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
    const record = renderData.value.find((item) => item.id === id);
    Modal.confirm({
      title: t('user.confirm.delete'),
      content: `确定删除用户 ${record?.nickname || record?.mobile || '该用户'} 吗？`,
      onOk: async () => {
        const res = await request.delete('/user', { params: { id } });
        Message.success(t('user.message.deleteSuccess'));
        getTableListHandle();
      },
    });
  };
  const onSwitchStatus = async (record: any) => {
    const { status, id } = record;
    const res = await request.patch(`/user/status`, { status, id });
    Message.success(t('common.message.setSuccess'));
  };
  const addRef = ref(addModal);
  const showModal = (type: string, id?: string) => {
    addRef.value.show({ type, id });
  };
  const resetHandle = async (record: any) => {
    const { mobile, nickname } = record;
    const userName = record?.nickname || record?.mobile || t('user.label.thisUser');
    Modal.confirm({
      title: t('user.confirm.resetPassword'),
      content: t('user.confirm.resetPasswordContent', { user: userName }),
      onOk: async () => {
        const res = await request.post('/user/resetPassword', { mobile, nickname });
        Message.success(t('user.message.resetPasswordSuccess'));
      },
    });
  };

  const formatDate = (date: string) => {
    return date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : '--';
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
