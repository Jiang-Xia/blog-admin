<template>
  <div class="container">
    <!-- <Breadcrumb :items="['menu.list', 'menu.list.searchTable']" /> -->
    <a-card class="general-card" :title="t('article.query.title')">
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
                <a-form-item :label="t('article.form.title')">
                  <a-input
                    v-model="formModel.title"
                    :placeholder="t('article.form.placeholder.title')"
                    @press-enter="search()"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item :label="t('article.form.description')">
                  <a-input
                    v-model="formModel.description"
                    :placeholder="t('article.form.placeholder.description')"
                    @press-enter="search()"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item :label="t('article.form.content')">
                  <a-input
                    v-model="formModel.content"
                    :placeholder="t('article.form.placeholder.content')"
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
              {{ t('article.button.create') }}
            </a-button>
            <a-button type="primary" @click="exportToExcel" :loading="exportLoading">
              <template #icon>
                <icon-download />
              </template>
              {{ t('article.button.export') }}
            </a-button>
            <a-button v-if="selectedRowKeys.length > 0" type="outline" @click="clearSelection">
              <template #icon>
                <icon-close />
              </template>
              {{ t('article.button.clearSelection') }}
            </a-button>
          </a-space>
        </a-col>
        <a-col :span="8" style="text-align: right">
          <a-space>
            <span v-if="selectedRowKeys.length > 0" style="color: #165dff; font-weight: 500">
              {{ t('article.message.selectedCount', { count: selectedRowKeys.length }) }}
            </span>
          </a-space>
        </a-col>
      </a-row>
      <a-table
        :loading="loading"
        row-key="id"
        :pagination="false"
        :data="renderData"
        :bordered="false"
        :row-selection="rowSelection"
        @selection-change="onSelectionChange"
        v-model:selected-row-keys="selectedRowKeys"
        scrollbar
        :scroll="{
          x: 600,
          y: 600,
        }"
      >
        <template #columns>
          <a-table-column
            :title="t('article.table.title')"
            data-index="title"
            :width="260"
            ellipsis
          >
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
          <a-table-column
            :title="t('article.table.description')"
            data-index="description"
            :width="140"
            ellipsis
            tooltip
          />
          <a-table-column :title="t('article.table.cover')" data-index="category" :width="100">
            <template #cell="{ record }">
              <a-popover title="">
                <a-image width="40" height="40" :src="record.cover" />
                <template #content>
                  <a-image width="200" height="200" :src="record.cover" />
                </template>
              </a-popover>
            </template>
          </a-table-column>
          <a-table-column :title="t('article.table.category')" data-index="category" :width="120">
            <template #cell="{ record }">
              <span :style="{ color: record.category?.color }">
                {{ record.category?.label }}
              </span>
            </template>
          </a-table-column>
          <a-table-column :title="t('article.table.tag')" data-index="tag" :width="120">
            <template #cell="{ record }">
              <span :style="{ color: record.tagColor }">
                {{ record.tag }}
              </span>
            </template>
          </a-table-column>
          <a-table-column :title="t('article.table.views')" data-index="views" :width="80" />
          <a-table-column :title="t('article.table.likes')" data-index="likes" :width="80" />
          <a-table-column
            :title="t('article.table.commentCount')"
            data-index="commentCount"
            :width="80"
          />
          <a-table-column :title="t('article.table.updateTime')" data-index="uTime" :width="200" />
          <a-table-column :title="t('article.table.topping')" :width="60" fixed="right">
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
          <a-table-column :title="t('article.table.disabled')" :width="60" fixed="right">
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
          <a-table-column
            :title="t('article.table.operation')"
            data-index="operations"
            :width="120"
            fixed="right"
          >
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
      <a-space style="width: 100%; padding-top: 16px; justify-content: flex-end">
        <a-pagination
          @change="onPageChange"
          @page-size-change="onPageSizeChange"
          :total="pagination.total"
          show-total
          show-jumper
          show-page-size
        />
      </a-space>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, reactive } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRouter } from 'vue-router';
  import useLoading from '@/hooks/loading';
  import type { Pagination } from '@/types/global';
  import { getArticleList, delArticle } from '@/api/article';
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

  // 跨页勾选功能
  const selectedRowKeys = ref<(string | number)[]>([]);
  const selectedRows = ref<any[]>([]);

  // 表格行选择配置
  const rowSelection = reactive({
    type: 'checkbox',
    showCheckedAll: true,
    onlyCurrent: false,
  });
  const basePagination: Pagination = {
    current: 1,
    pageSize: 10,
    total: 0,
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
    pagination.total = res.pagination.total;
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
  const onPageSizeChange = (pageSize: number) => {
    pagination.current = 1;
    pagination.pageSize = pageSize;
    formModel.value.pageSize = pageSize;
    getArticleListHandle(pagination.current);
  };
  const onSelectionChange = (rowKeys: (string | number)[]) => {
    selectedRowKeys.value = rowKeys;

    // 获取当前页新选中的数据
    const currentPageSelectedRows = renderData.value.filter((row: any) => rowKeys.includes(row.id));

    // 移除当前页已取消选择的数据
    selectedRows.value = selectedRows.value.filter(
      (row: any) =>
        !renderData.value.some((currentRow: any) => currentRow.id === row.id) ||
        rowKeys.includes(row.id),
    );

    // 添加当前页新选中的数据(避免重复)
    currentPageSelectedRows.forEach((row: any) => {
      if (!selectedRows.value.some((existingRow: any) => existingRow.id === row.id)) {
        selectedRows.value.push(row);
      }
    });
  };
  getArticleListHandle();
  const reset = () => {
    formModel.value = generateFormModel();
  };
  const delArticleHandle = async (id: string | number) => {
    Modal.confirm({
      title: t('article.confirm.delete'),
      content: t('article.confirm.deleteContent'),
      onOk: async () => {
        const res = await delArticle({ id });
        Message.success(t('article.message.deleteSuccess'));
        getArticleListHandle();
      },
    });
  };
  // 文章禁用
  const onSwitchChange = async (record: { isDelete: boolean; id: string | number }) => {
    const { isDelete, id } = record;
    const res = await request.patch(`/article/disabled`, { isDelete, id });
    Message.success(t('article.message.publishSuccess'));
  };
  // 文章置顶
  const onSwitchTopping = async (record: { topping: boolean; id: string | number }) => {
    const { topping, id } = record;
    const res = await request.patch(`/article/topping`, { topping, id });
    Message.success(t('article.message.publishSuccess'));
  };

  // 清空选择
  const clearSelection = () => {
    selectedRowKeys.value = [];
    selectedRows.value = [];
    Message.info(t('article.message.selectionCleared'));
  };

  // 导出Excel - 仅导出勾选的数据
  const exportToExcel = async () => {
    try {
      // 检查是否有勾选数据
      if (selectedRows.value.length === 0) {
        Message.warning(t('article.message.noSelectedData'));
        return;
      }

      exportLoading.value = true;

      // 使用勾选的数据进行导出
      const articles = selectedRows.value.map((v: any) => {
        return {
          [t('article.excel.id')]: v.id,
          [t('article.excel.title')]: v.title,
          [t('article.excel.description')]: v.description,
          [t('article.excel.category')]: v.category?.label || '',
          [t('article.excel.tag')]: v.tags?.map((it: any) => it.label).join(', ') || v.tag || '',
          [t('article.excel.views')]: v.views || 0,
          [t('article.excel.likes')]: v.likes || 0,
          [t('article.excel.commentCount')]: v.commentCount || 0,
          [t('article.excel.updateTime')]: v.uTime || '',
          [t('article.excel.toppingStatus')]: v.topping
            ? t('article.excel.yes')
            : t('article.excel.no'),
          [t('article.excel.disabledStatus')]: v.isDelete
            ? t('article.excel.yes')
            : t('article.excel.no'),
        };
      });

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
      XLSX.utils.book_append_sheet(wb, ws, t('article.excel.sheetName'));

      // 生成文件名
      const now = new Date();
      const timestamp = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
      const fileName = `${t('article.excel.sheetName')}_${timestamp}.xlsx`;

      // 下载文件
      XLSX.writeFile(wb, fileName);

      Message.success(
        t('article.message.exportSuccess') +
          ` (${selectedRows.value.length}${t('article.message.items')})`,
      );
    } catch (error) {
      console.error('导出失败:', error);
      Message.error(t('article.message.exportFail'));
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
