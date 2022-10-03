<template>
  <div class="container">
    <!-- <Breadcrumb :items="['menu.list', 'menu.list.searchTable']" /> -->
    <a-card class="general-card" title="用户查询">
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
                <a-form-item label="手机号">
                  <a-input
                    v-model="formModel.mobile"
                    placeholder="请输入手机号"
                  />
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
          <a-table-column title="手机号" data-index="mobile" />
          <a-table-column title="昵称" data-index="nickname" />
          <!-- <a-table-column title="标签" data-index="tag">
            <template #cell="{ record }">
              {{ record.tag }}
            </template>
          </a-table-column> -->
          <a-table-column title="角色类型" data-index="role" />
          <a-table-column title="锁定" data-index="status">
            <template #cell="{ record }">
              <!-- :disabled="record.agreed" -->
              <a-switch
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
          <a-table-column title="操作" data-index="operations">
            <template #cell="{ record }">
              <a-space :size="8">
                <a-button
                  size="mini"
                  type="primary"
                  status="danger"
                  @click="delHandle(record.id)"
                >
                  <icon-delete />
                </a-button>
                <a-button
                  size="mini"
                  type="primary"
                  :disabled="record.role === 'super'"
                  @click="resetHandle(record)"
                >
                  重置密码
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
  import { Pagination } from '@/types/global';
  import { Message, Modal } from '@arco-design/web-vue';
  import request from '@/api/request';
  import addModal from './addUser.vue';

  const generateFormModel = () => {
    return {
      page: 1,
      pageSize: 10,
      total: 0,
      mobile: '',
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
    const res = await request
      .post('/user/list', formModel.value)
      .then((res) => res.data);
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
      title: '删除用户',
      content: '确定删除该用户嘛？',
      onOk: async () => {
        const res = await request.delete('/user', { params: { id } });
        Message.success('删除成功');
        getTableListHandle();
      },
    });
  };
  const onSwitchStatus = async (record: any) => {
    const { status, id } = record;
    const res = await request.patch(`/user/status`, { status, id });
    Message.success('设置成功');
  };
  const addRef = ref(addModal);
  const showModal = (type: string, id?: string) => {
    addRef.value.show({ type, id });
  };
  const resetHandle = async (record: any) => {
    const { mobile, nickname } = record;
    const res: any = await request.post(`/user/resetPassword`, {
      mobile,
      nickname,
    });
    Message.success(res.message);
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
