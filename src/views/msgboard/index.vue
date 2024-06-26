<template>
  <div class="container">
    <!-- <Breadcrumb :items="['menu.list', 'menu.list.searchTable']" /> -->
    <a-card class="general-card" title="留言板查询">
      <a-row align="center">
        <a-col :flex="1">
          <a-form
            :model="formModel"
            :label-col-props="{ span: 6 }"
            :wrapper-col-props="{ span: 18 }"
            label-align="left"
          >
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="评论内容">
                  <a-input
                    v-model="formModel.comment"
                    placeholder="请输入评论内容"
                    @press-enter="search()"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="回复内容">
                  <a-input
                    v-model="formModel.respondent"
                    placeholder="请输入回复内容"
                    @press-enter="search()"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="邮箱">
                  <a-input
                    v-model="formModel.eamil"
                    placeholder="请输入邮箱"
                    @press-enter="search()"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="昵称">
                  <a-input
                    v-model="formModel.name"
                    placeholder="请输入昵称"
                    @press-enter="search()"
                  />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
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
      <a-table
        :loading="loading"
        row-key="id"
        :pagination="pagination"
        :data="renderData"
        :bordered="false"
        @page-change="onPageChange"
        stripe
      >
        <template #columns>
          <a-table-column title="昵称" data-index="name"  align="center" :width="100"/>
          <a-table-column title="头像" data-index="avatar" align="center" :width="100">
            <template #cell="{ record }">
              <a-avatar>
                <img :alt="record.title" :src="record.avatar" />
              </a-avatar>
            </template>
          </a-table-column>
          <a-table-column title="评论内容" data-index="comment" :width="460" tooltip ellipsis />
          <a-table-column title="网址" data-index="address" :width="200" tooltip>
            <template #cell="{ record }">
              <a-link :href="record.address" target="_blank">{{
                record.address
              }}</a-link>
            </template>
          </a-table-column>
          <!-- <a-table-column title="状态" data-index="url">
            <template #cell="{ record }">
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
          </a-table-column> -->
          <a-table-column title="操作" data-index="operations" :width="100" fixed="right">
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
  import request from '@/api/request';
  import { useTableList } from '@/hooks/data';

  const generateFormModel = () => {
    return {
      name: '',
      comment: '',
      eamil: '',
      respondent: '',
    };
  };
  const formModel = ref(generateFormModel());
  const {
    pagination,
    action,
    loading,
    list: renderData,
    loadMore,
  } = useTableList('/msgboard', formModel.value);
  const search = () => {
    action.value = formModel.value;
    loadMore();
  };
  const onPageChange = (current: number) => {
    search();
  };
  const reset = () => {
    formModel.value = generateFormModel();
    search();
  };
  const delHandle = async (id: number) => {
    Modal.confirm({
      title: '删除留言',
      content: '确定删除该留言嘛？',
      onOk: async () => {
        const res = await request.post('/msgboard/delete', [id]);
        Message.success('删除成功');
        search();
      },
    });
  };
  const onSwitchChange = async (record: any) => {
    const { agreed, id } = record;
    const res = await request.patch(`/msgboard`, { agreed, id });
    Message.success('设置成功');
  };
</script>

<script lang="ts">
  export default {
    name: 'MsgboardTable',
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
