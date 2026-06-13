<template>
  <div class="container">
    <!-- <Breadcrumb :items="['menu.list', 'menu.list.searchTable']" /> -->
    <a-card class="general-card" :title="t('comment.query.title')">
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
                <a-form-item :label="t('comment.form.selectArticle')">
                  <a-select
                    v-model="formModel.articleId"
                    :options="articleOptions"
                    :placeholder="t('comment.form.placeholder.selectArticle')"
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
              {{ t('comment.button.search') }}
            </a-button>
            <a-button @click="reset">
              <template #icon>
                <icon-refresh />
              </template>
              {{ t('comment.button.reset') }}
            </a-button>
          </a-space>
        </a-col>
      </a-row>
      <a-table
        :key="tableKey"
        :loading="loading"
        row-key="rowKey"
        :pagination="false"
        :data="renderData"
        :bordered="false"
        stripe
        scrollbar
        :scroll="{ x: 1380, y: 600 }"
      >
        <template #columns>
          <a-table-column
            :title="t('comment.table.nickname')"
            data-index="userInfo.nickname"
            align="center"
            :width="140"
          >
            <template #cell="{ record }">
              {{ record.userInfo.nickname }}
            </template>
          </a-table-column>
          <a-table-column
            :title="t('comment.table.avatar')"
            data-index="avatar"
            align="center"
            :width="140"
          >
            <template #cell="{ record }">
              <a-avatar>
                <img :alt="record.title" :src="record.userInfo.avatar" />
              </a-avatar>
            </template>
          </a-table-column>
          <a-table-column
            :title="t('comment.table.replyNickname')"
            data-index="userInfo.nickname"
            align="center"
            :width="140"
          >
            <template #cell="{ record }">
              <span v-if="record.tUserInfo">@{{ record.tUserInfo.nickname }}</span>
            </template>
          </a-table-column>
          <a-table-column
            :title="t('comment.table.replyAvatar')"
            data-index="avatar"
            align="center"
            :width="140"
          >
            <template #cell="{ record }">
              <a-avatar v-if="record.tUserInfo">
                <img :alt="record.title" :src="record.tUserInfo.avatar" />
              </a-avatar>
            </template>
          </a-table-column>
          <a-table-column
            :title="t('comment.table.content')"
            data-index="content"
            :width="460"
            tooltip
            ellipsis
          />
          <a-table-column
            :title="t('comment.table.replyCount')"
            data-index="allReplyCount"
            :width="160"
            tooltip
            ellipsis
          />
          <a-table-column
            :title="t('comment.table.updateTime')"
            data-index="updateTime"
            :width="200"
            tooltip
          >
            <template #cell="{ record }">
              {{ $dayjs(record.updateTime).format('YYYY-MM-DD HH:mm:ss') }}
            </template>
          </a-table-column>
          <a-table-column
            :title="t('comment.table.operation')"
            data-index="operations"
            :width="120"
            fixed="right"
          >
            <template #cell="{ record }">
              <a-space :size="8">
                <a-button size="mini" type="primary" status="danger" @click="delHandle(record)">
                  <icon-delete />
                </a-button>
              </a-space>
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
  import { computed, ref, reactive, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  // import useLoading from '@/hooks/loading';
  import type { Pagination } from '@/types/global';
  import { Message, Modal } from '@arco-design/web-vue';
  import { useTableList } from '@/hooks/data';
  import { delComment, delReply, getArticleList } from '@/api/article';

  const { t } = useI18n();

  const generateFormModel = () => {
    return {
      articleId: '',
      page: 1,
      pageSize: 10,
    };
  };
  const formModel = ref(generateFormModel());
  const basePagination: Pagination = {
    current: 1,
    pageSize: 10,
  };
  const pagination = reactive({
    ...basePagination,
  });
  const {
    action,
    loading,
    list: commentData,
    total,
    loadMore,
  } = useTableList('/comment/findAll', formModel.value, undefined, false);
  const articleOptions: any = ref([]);
  const tableKey = ref(0);
  const renderData = computed(() => {
    return commentData.value.map((v: any) => {
      const replys = v.replys || [];
      return {
        ...v,
        rowKey: `comment-${v.id}`,
        isLeaf: replys.length === 0,
        children: replys.length
          ? replys.map((v2: any) => ({
              ...v2,
              rowKey: `reply-${v2.id}`,
              isLeaf: true,
            }))
          : undefined,
      };
    });
  });
  watch(
    () => commentData.value,
    (n) => {
      pagination.total = total.value;
    },
  );
  getArticleList({
    sort: 'desc',
    page: 1,
    pageSize: 999999,
    client: true,
  }).then((res) => {
    articleOptions.value = res.list;
    formModel.value.articleId = res.list[0]?.id;
    refreshList();
  });
  const refreshList = async () => {
    await loadMore();
    tableKey.value += 1;
  };
  const search = () => {
    action.value = formModel.value;
    refreshList();
  };
  const onPageChange = (current: number) => {
    formModel.value.page = current;
    pagination.current = current;
    search();
  };
  const onPageSizeChange = (pageSize: number) => {
    formModel.value.page = 1;
    formModel.value.pageSize = pageSize;
    pagination.current = 1;
    pagination.pageSize = pageSize;
    search();
  };
  const reset = () => {
    formModel.value = generateFormModel();
    formModel.value.articleId = articleOptions.value[0]?.id;
    pagination.current = 1;
    search();
  };
  const delHandle = async (record: any) => {
    const isReply = !!record.tUserInfo;
    Modal.confirm({
      title: t('comment.confirm.delete'),
      content: t('comment.confirm.deleteContent'),
      onOk: async () => {
        if (isReply) {
          await delReply(record.id);
        } else {
          await delComment(record.id);
        }
        Message.success(t('comment.message.deleteSuccess'));
        await refreshList();
      },
    });
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
