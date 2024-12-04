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
                <a-form-item label="选择文章">
                  <a-select
                    v-model="formModel.articleId"
                    :options="articleOptions"
                    placeholder="选择分类"
                    :field-names="{ value: 'id', label: 'title' }"
                    allow-search
                  >
                  </a-select>
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
        stripe
        :load-more="loadTableDataMore"
        @page-change="onPageChange"
      >
        <template #columns>
          <a-table-column
            title="昵称"
            data-index="userInfo.nickname"
            align="center"
            :width="140"
          >
            <template #cell="{ record }">
              {{ record.userInfo.nickname }}
            </template>
          </a-table-column>
          <a-table-column
            title="头像"
            data-index="avatar"
            align="center"
            :width="100"
          >
            <template #cell="{ record }">
              <a-avatar>
                <img :alt="record.title" :src="record.userInfo.avatar" />
              </a-avatar>
            </template>
          </a-table-column>
          <a-table-column
            title="@昵称"
            data-index="userInfo.nickname"
            align="center"
            :width="140"
          >
            <template #cell="{ record }">
              <span v-if="record.tUserInfo"
                >@{{ record.tUserInfo.nickname }}</span
              >
            </template>
          </a-table-column>
          <a-table-column
            title="@头像"
            data-index="avatar"
            align="center"
            :width="100"
          >
            <template #cell="{ record }">
              <a-avatar v-if="record.tUserInfo">
                <img :alt="record.title" :src="record.tUserInfo.avatar" />
              </a-avatar>
            </template>
          </a-table-column>
          <a-table-column
            title="评论内容"
            data-index="content"
            :width="460"
            tooltip
            ellipsis
          />
          <a-table-column
            title="回复数"
            data-index="allReplyCount"
            :width="160"
            tooltip
            ellipsis
          />
          <a-table-column
            title="评论时间"
            data-index="updateTime"
            :width="200"
            tooltip
          >
            <template #cell="{ record }">
              {{ $dayjs(record.updateTime).format('YYYY-MM-DD HH:mm:ss') }}
            </template>
          </a-table-column>
          <a-table-column
            title="操作"
            data-index="operations"
            :width="100"
            fixed="right"
          >
            <template #cell="{ record }">
              <a-space :size="8">
                <a-button
                  size="mini"
                  type="primary"
                  status="danger"
                  @click="delHandle(record)"
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
  // import { useI18n } from 'vue-i18n';
  // import useLoading from '@/hooks/loading';
  // import { Pagination } from '@/types/global';
  import { Message, Modal } from '@arco-design/web-vue';
  import request from '@/api/request';
  import { useTableList } from '@/hooks/data';
  import { getArticleList } from '@/api/article';

  const generateFormModel = () => {
    return {
      articleId: '',
    };
  };
  const formModel = ref(generateFormModel());
  const {
    pagination,
    action,
    loading,
    list: commentData,
    loadMore,
  } = useTableList('/comment/findAll', formModel.value, undefined, false);
  const articleOptions: any = ref([]);

  const renderData = computed(() => {
    const list = commentData.value.map((v: any) => {
      v.isLeaf = !v.replys.length;
      v.replys.map((v2: any) => {
        v2.isLeaf = true;
        return v2;
      });
      return v;
    });
    return list;
  });

  getArticleList({
    sort: 'desc',
    page: 1,
    pageSize: 999999,
    client: true,
  }).then((res) => {
    articleOptions.value = res.list;
    formModel.value.articleId = res.list[0]?.id;
    loadMore();
  });
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
  const delHandle = async (record: any) => {
    let url = '/comment/delete';
    if (record.tUserInfo) {
      url = '/reply/delete';
    }
    Modal.confirm({
      title: '删除评论',
      content: '确定删除该评论嘛？',
      onOk: async () => {
        const res = await request.post(url, [record.id]);
        Message.success('删除成功');
        search();
      },
    });
  };
  const loadTableDataMore = (record: any, done: any) => {
    done(record.replys);
  };
</script>

<script lang="ts">
  export default {
    name: 'CommentTable',
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
