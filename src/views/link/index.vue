<template>
  <div class="container">
    <!-- <Breadcrumb :items="['menu.list', 'menu.list.searchTable']" /> -->
    <a-card class="general-card" title="友链查询">
      <a-row style="margin-bottom: 16px">
        <a-col :span="16">
          <!-- <a-space>
            <a-button type="primary">
              <template #icon>
                <icon-plus />
              </template>
              {{ '新建' }}
            </a-button>
          </a-space> -->
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
          <a-table-column title="标题" data-index="title" />
          <a-table-column title="图标" data-index="url" align="center">
            <template #cell="{ record }">
              <a-avatar>
                <img :alt="record.title" :src="record.icon" />
              </a-avatar>
            </template>
          </a-table-column>
          <a-table-column title="描述" data-index="desp" />
          <a-table-column title="网址" data-index="url">
            <template #cell="{ record }">
              <a-link :href="record.url">{{ record.url }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="状态" data-index="url">
            <template #cell="{ record }">
              <!-- :disabled="record.agreed" -->
              <a-switch
                v-model="record.agreed"
                @change="onSwitchChange(record)"
              >
                <template #checked-icon>
                  <icon-check />
                </template>
                <template #unchecked-icon>
                  <icon-close />
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
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, reactive } from 'vue';
  import { useI18n } from 'vue-i18n';
  import useLoading from '@/hooks/loading';
  import { Pagination } from '@/types/global';
  import { Message, Modal } from '@arco-design/web-vue';
  import axios from 'axios';

  const generateFormModel = () => {
    return {
      page: 1,
      category: '',
      tags: [],
      pageSize: 20,
      total: 0,
      title: '',
      description: '',
      content: '',
      uid: 1,
    };
  };
  const { loading, setLoading } = useLoading(true);
  const { t } = useI18n();
  const renderData = ref([]);
  const formModel = ref(generateFormModel());
  const basePagination: Pagination = {
    current: 1,
    pageSize: 20,
  };
  const pagination = reactive({
    ...basePagination,
  });
  const getListHandle = async (val = 1) => {
    setLoading(true);
    const res = await axios.get('/link');
    renderData.value = res.data;
    pagination.total = res.data.length;
    setLoading(false);
  };
  const search = () => {
    getListHandle();
  };
  const onPageChange = (current: number) => {
    getListHandle();
  };
  getListHandle();
  const reset = () => {
    formModel.value = generateFormModel();
  };
  const delHandle = async (id: number) => {
    Modal.confirm({
      title: '删除友链',
      content: '确定删除该友链嘛？',
      onOk: async () => {
        const res = await axios.delete('/link', { data: { id } });
        Message.success('删除成功');
        getListHandle();
      },
    });
  };
  const onSwitchChange = async (record: any) => {
    const { agreed, id } = record;
    const res = await axios.patch(`/link`, { agreed, id });
    Message.success('设置成功');
  };
</script>

<script lang="ts">
  export default {
    name: 'LinkTable',
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
