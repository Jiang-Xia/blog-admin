<template>
  <div class="container">
    <!-- <Breadcrumb :items="['menu.list', 'menu.list.searchTable']" /> -->
    <a-card class="general-card" title="文章查询">
      <a-row>
        <a-col :flex="1">
          <a-form
            :model="formModel"
            :label-col-props="{ span: 6 }"
            :wrapper-col-props="{ span: 18 }"
            label-align="left"
          >
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item label="标题">
                  <a-input
                    v-model="formModel.title"
                    placeholder="请输入关键字"
                    @press-enter="search()"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="描述">
                  <a-input
                    v-model="formModel.description"
                    placeholder="请输入描述"
                    @press-enter="search()"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="内容">
                  <a-input
                    v-model="formModel.content"
                    placeholder="请输入文章内容"
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

      <a-divider style="margin-top: 0" />

      <a-row style="margin-bottom: 16px">
        <a-col :span="16">
          <a-space>
            <a-button
              type="primary"
              @click="$router.push('/article/edit?type=add')"
            >
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
          <a-table-column title="标题" data-index="title">
            <template #cell="{ record }">
              <a-popover title="">
                <span>{{ record.title }}</span>
                <template #content>
                  <a-link
                    :href="'https://jiang-xia.top/detail/' + record.id"
                    target="_blank"
                    icon
                    >{{ record.title }}</a-link
                  >
                </template>
              </a-popover>
            </template>
          </a-table-column>
          <a-table-column title="描述" data-index="description" />
          <a-table-column title="封面" data-index="category">
            <template #cell="{ record }">
              <a-popover title="">
                <a-image width="40" height="40" :src="record.cover" />
                <template #content>
                  <a-image width="200" height="200" :src="record.cover" />
                </template>
              </a-popover>
            </template>
          </a-table-column>
          <a-table-column title="分类" data-index="category">
            <template #cell="{ record }">
              <span :style="{ color: record.category?.color }">
                {{ record.category?.label }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="标签" data-index="tag">
            <template #cell="{ record }">
              <span :style="{ color: record.tagColor }">
                {{ record.tag }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="查看" data-index="views" />
          <a-table-column title="点赞" data-index="likes" />
          <a-table-column title="评论" data-index="commentCount" />
          <a-table-column title="置顶" data-index="url">
            <template #cell="{ record }">
              <!-- :disabled="record.agreed" -->
              <a-switch
                v-model="record.topping"
                active-color="red"
                @change="onSwitchTopping(record)"
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
          <a-table-column title="禁用" data-index="url">
            <template #cell="{ record }">
              <!-- :disabled="record.agreed" -->
              <a-switch
                v-model="record.isDelete"
                active-color="red"
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
          <a-table-column title="更新时间" data-index="uTime" />
          <a-table-column title="操作" data-index="operations">
            <template #cell="{ record }">
              <a-space :size="8">
                <a-button
                  size="mini"
                  type="primary"
                  @click="
                    () => {
                      $router.push(`/article/edit?type=edit&id=${record.id}`);
                    }
                  "
                >
                  <icon-edit />
                </a-button>
                <!-- v-permission="['admin']" -->
                <a-button
                  size="mini"
                  type="primary"
                  status="danger"
                  @click="delArticleHandle(record.id)"
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
  import { getArticleInfo, getArticleList, delArticle } from '@/api/article';
  import { Message, Modal } from '@arco-design/web-vue';
  import request from '@/api/request';
  import { useUserStore } from '@/store';

  const { role } = useUserStore();
  const generateFormModel = () => {
    return {
      page: 1,
      category: '',
      tags: [],
      pageSize: 10,
      total: 0,
      title: '',
      description: '',
      content: '',
      uid: 1,
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
  const getArticleListHandle = async (val = 1) => {
    setLoading(true);
    const onlyMy = role === 'author'; // 作者只返回自身文章
    formModel.value.page = val;
    pagination.current = val;
    const params = {
      onlyMy,
      ...formModel.value,
    };
    const res = await getArticleList(params);
    renderData.value = res.list.map((v: any) => {
      // v.category = v.category.label;
      v.tag = v.tags.map((v: any) => v.label).join();
      v.tagColor = v.tags[0]?.color;
      // console.log(v.category);
      return v;
    });
    pagination.total = res.pagination.total;
    setLoading(false);
  };
  const search = () => {
    pagination.current = 1;
    getArticleListHandle();
  };
  const onPageChange = (current: number) => {
    getArticleListHandle(current);
  };
  getArticleListHandle();
  const reset = () => {
    formModel.value = generateFormModel();
  };
  const delArticleHandle = async (id: any) => {
    Modal.confirm({
      title: '删除文章',
      content: '确定删除该文章嘛？',
      onOk: async () => {
        const res = await delArticle({ id });
        Message.success('删除成功');
        getArticleListHandle();
      },
    });
  };
  // 文章禁用
  const onSwitchChange = async (record: any) => {
    const { isDelete, id } = record;
    const res = await request.patch(`/article/disabled`, { isDelete, id });
    Message.success('设置成功');
  };
  // 文章置顶
  const onSwitchTopping = async (record: any) => {
    const { topping, id } = record;
    const res = await request.patch(`/article/topping`, { topping, id });
    Message.success('设置成功');
  };
</script>

<script lang="ts">
  export default {
    name: 'ArticleList',
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
