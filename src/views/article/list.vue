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
              v-permission="'article:create'"
              type="primary"
              @click="router.push('/article/edit?type=add')"
            >
              <template #icon>
                <icon-plus />
              </template>
              {{ '新建' }}
            </a-button>
            <a-button type="primary" @click="exportToExcel" :loading="exportLoading">
              <template #icon>
                <icon-download />
              </template>
              {{ '导出Excel' }}
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
          <a-table-column title="标题" data-index="title" :width="260" ellipsis>
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
          <a-table-column title="描述" data-index="description" :width="140" ellipsis tooltip />
          <a-table-column title="封面" data-index="category" :width="100">
            <template #cell="{ record }">
              <a-popover title="">
                <a-image width="40" height="40" :src="record.cover" />
                <template #content>
                  <a-image width="200" height="200" :src="record.cover" />
                </template>
              </a-popover>
            </template>
          </a-table-column>
          <a-table-column title="分类" data-index="category" :width="120">
            <template #cell="{ record }">
              <span :style="{ color: record.category?.color }">
                {{ record.category?.label }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="标签" data-index="tag" :width="120">
            <template #cell="{ record }">
              <span :style="{ color: record.tagColor }">
                {{ record.tag }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="查看" data-index="views" :width="80" />
          <a-table-column title="点赞" data-index="likes" :width="80" />
          <a-table-column title="评论" data-index="commentCount" :width="80" />
          <a-table-column title="更新时间" data-index="uTime" :width="200" />
          <a-table-column title="置顶" :width="60" fixed="right">
            <template #cell="{ record }">
              <!-- :disabled="record.agreed" -->
              <a-switch
                v-permission="'article:topping'"
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
          <a-table-column title="禁用" :width="60" fixed="right">
            <template #cell="{ record }">
              <!-- :disabled="record.agreed" -->
              <a-switch
                v-permission="'article:disabled'"
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
          <a-table-column title="操作" data-index="operations" :width="120" fixed="right">
            <template #cell="{ record }">
              <a-space :size="8">
                <a-button
                  v-permission="'article:edit'"
                  size="mini"
                  type="primary"
                  @click="
                    () => {
                      router.push(`/article/edit?type=edit&id=${record.id}`);
                    }
                  "
                >
                  <icon-edit />
                </a-button>
                <a-button
                  v-permission="'article:delete'"
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
  import { useRouter } from 'vue-router';
  import useLoading from '@/hooks/loading';
  import type { Pagination } from '@/types/global';
  import { getArticleInfo, getArticleList, delArticle } from '@/api/article';
  import { Message, Modal } from '@arco-design/web-vue';
  import request from '@/api/request';
  import { useUserStore } from '@/store';
  import * as XLSX from 'xlsx';

  const { role } = useUserStore();
  const router = useRouter();
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
  const exportLoading = ref(false);
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
    renderData.value = res.list.map(
      (v: {
        tags: Array<{ label: string; color?: string }>;
        id: string | number;
        cover: string;
        title: string;
        description: string;
        category?: { label: string; color?: string };
        [k: string]: unknown;
      }) => {
        // v.category = v.category.label;
        v.tag = v.tags.map((it) => it.label).join();
        v.tagColor = v.tags[0]?.color;
        // console.log(v.category);
        return v;
      },
    );
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
  const delArticleHandle = async (id: string | number) => {
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
  const onSwitchChange = async (record: { isDelete: boolean; id: string | number }) => {
    const { isDelete, id } = record;
    const res = await request.patch(`/article/disabled`, { isDelete, id });
    Message.success('设置成功');
  };
  // 文章置顶
  const onSwitchTopping = async (record: { topping: boolean; id: string | number }) => {
    const { topping, id } = record;
    const res = await request.patch(`/article/topping`, { topping, id });
    Message.success('设置成功');
  };

  // 导出Excel
  const exportToExcel = async () => {
    try {
      exportLoading.value = true;

      // 获取所有文章数据（使用最大pageSize）
      const onlyMy = role === 'author';
      const exportParams = {
        onlyMy,
        page: 1,
        pageSize: 999999, // 设置一个很大的值来获取所有数据
        title: formModel.value.title,
        description: formModel.value.description,
        content: formModel.value.content,
        category: formModel.value.category,
        tags: formModel.value.tags,
        uid: formModel.value.uid,
      };

      const res = await getArticleList(exportParams);
      const articles = res.list.map(
        (v: {
          tags: Array<{ label: string; color?: string }>;
          id: string | number;
          cover: string;
          title: string;
          description: string;
          category?: { label: string; color?: string };
          [k: string]: unknown;
        }) => {
          return {
            文章ID: v.id,
            标题: v.title,
            描述: v.description,
            分类: v.category?.label || '',
            标签: v.tags.map((it) => it.label).join(', '),
            查看数: v.views || 0,
            点赞数: v.likes || 0,
            评论数: v.commentCount || 0,
            更新时间: v.uTime || '',
            置顶状态: v.topping ? '是' : '否',
            禁用状态: v.isDelete ? '是' : '否',
          };
        },
      );

      // 创建工作簿
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(articles);

      // 设置列宽
      const colWidths = [
        { wch: 10 }, // 文章ID
        { wch: 30 }, // 标题
        { wch: 40 }, // 描述
        { wch: 15 }, // 分类
        { wch: 20 }, // 标签
        { wch: 10 }, // 查看数
        { wch: 10 }, // 点赞数
        { wch: 10 }, // 评论数
        { wch: 20 }, // 更新时间
        { wch: 10 }, // 置顶状态
        { wch: 10 }, // 禁用状态
      ];
      ws['!cols'] = colWidths;

      // 添加工作表到工作簿
      XLSX.utils.book_append_sheet(wb, ws, '文章列表');

      // 生成文件名
      const now = new Date();
      const timestamp = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
      const fileName = `文章列表_${timestamp}.xlsx`;

      // 下载文件
      XLSX.writeFile(wb, fileName);

      Message.success('导出成功！');
    } catch (error) {
      console.error('导出失败:', error);
      Message.error('导出失败，请重试');
    } finally {
      exportLoading.value = false;
    }
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
