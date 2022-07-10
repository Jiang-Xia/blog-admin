<template>
  <div class="container">
    <!-- <Breadcrumb :items="['menu.list', 'menu.list.searchTable']" /> -->
    <a-card class="general-card" title="分类查询">
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
                <a-form-item label="分类名">
                  <a-input
                    v-model="formModel.title"
                    placeholder="请输入分类名"
                  />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-col>
        <a-col :span="10" style="text-align: right">
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
            <a-button type="primary" @click="addHandle">
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
          <a-table-column title="分类名" data-index="label" />
          <a-table-column title="分类文章数" data-index="articleCount">
            <template #cell="{ record }">
              <a-tag color="#00ADB5" size="small">{{
                record.articleCount
              }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="颜色" data-index="color">
            <template #cell="{ record }">
              <span :style="{ backgroundColor: record.color }">
                {{ record.color }}
              </span>
              {{ record.category }}
            </template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="createAt" />
          <a-table-column title="操作" data-index="operations">
            <template #cell="{ record }">
              <a-space :size="8">
                <!-- v-permission="['admin']" -->
                <a-button
                  size="mini"
                  type="primary"
                  status="danger"
                  @click="delHandle(record.value)"
                >
                  <icon-delete />
                </a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
      <CreateModal v-model:value="visibale" type="分类" @ok="ceateOkHandle" />
    </a-card>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, reactive, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import useLoading from '@/hooks/loading';
  import { Pagination } from '@/types/global';
  import { Message, Modal } from '@arco-design/web-vue';
  import api from '@/api/index';
  import CreateModal from './create-modal.vue';
  import {
    getOptions,
    ceateOkHandle,
    delCategoryTag,
    categoryOptions,
  } from '../article/common';

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
  const visibale = ref(false);

  watch(
    () => categoryOptions.value, // 需写到value
    () => {
      renderData.value = categoryOptions.value;
      setLoading(false);
    }
  );
  const search = () => {
    getOptions('分类');
  };
  const onPageChange = (current: number) => {
    getOptions('分类');
  };
  getOptions('分类');
  const reset = () => {
    formModel.value = generateFormModel();
  };
  const addHandle = () => {
    visibale.value = true;
  };
  const delHandle = async (id: string) => {
    Modal.confirm({
      title: '删除分类',
      content: '确定删除该分类嘛？',
      onOk: async () => {
        const res = await delCategoryTag('分类', id);
        Message.success('删除成功');
        getOptions('分类');
      },
    });
  };
</script>

<script lang="ts">
  export default {
    name: 'SearchTable',
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
