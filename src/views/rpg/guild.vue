<template>
  <div class="container">
    <a-card class="general-card" title="公会管理">
      <a-row>
        <a-col :flex="1">
          <a-form label-align="left">
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item label="关键词">
                  <a-input
                    v-model="formModel.keyword"
                    placeholder="公会名称"
                    allow-clear
                    @press-enter="search"
                  />
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
          <a-table-column title="ID" data-index="id" :width="70" />
          <a-table-column title="名称" data-index="name" :width="140" />
          <a-table-column title="成员数" data-index="memberCount" :width="80" align="center" />
          <a-table-column title="会长" data-index="leaderUid" :width="140">
            <template #cell="{ record }">
              <div>{{ record.leaderUid }}</div>
              <div class="user-name">{{ formatLeaderName(record) }}</div>
            </template>
          </a-table-column>
          <a-table-column title="公告" data-index="announcement" :width="200" ellipsis tooltip />
          <a-table-column title="创建时间" data-index="createTime" :width="170">
            <template #cell="{ record }">
              {{
                record.createTime ? $dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') : '-'
              }}
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="80" fixed="right">
            <template #cell="{ record }">
              <a-button size="mini" type="primary" status="danger" @click="handleDelete(record)">
                <icon-delete />
              </a-button>
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
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import { Message, Modal } from '@arco-design/web-vue';
  import { IconDelete, IconSearch, IconRefresh } from '@arco-design/web-vue/es/icon';
  import type { Pagination } from '@/types/global';
  import { getGuildList, deleteGuild } from '@/api/rpg';
  import useLoading from '@/hooks/loading';

  const { loading, setLoading } = useLoading(true);
  const formModel = ref({ keyword: '', page: 1, pageSize: 20 });
  const tableData = ref<any[]>([]);
  const basePagination: Pagination = { current: 1, pageSize: 20, total: 0 };
  const pagination = reactive({ ...basePagination });

  const formatLeaderName = (record: any) => record.leaderNickname || record.leaderUsername || '-';

  const loadData = async () => {
    setLoading(true);
    try {
      const res: any = await getGuildList(formModel.value);
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
    formModel.value = { keyword: '', page: 1, pageSize: 20 };
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

  const handleDelete = (record: any) => {
    Modal.confirm({
      title: '解散公会',
      content: `确定解散公会「${record.name}」吗？此操作不可恢复。`,
      onOk: async () => {
        await deleteGuild(record.id);
        Message.success('已解散');
        loadData();
      },
    });
  };
</script>

<style scoped lang="less">
  .container {
    padding: 20px;
  }
  .user-name {
    color: var(--color-text-3);
    font-size: 12px;
  }
  :deep(.arco-table-th) {
    &:last-child {
      .arco-table-th-item-title {
        margin-left: 16px;
      }
    }
  }
</style>
