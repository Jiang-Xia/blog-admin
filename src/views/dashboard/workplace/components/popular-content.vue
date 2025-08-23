<template>
  <a-spin :loading="loading" style="width: 100%">
    <a-card
      class="general-card"
      :header-style="{ paddingBottom: '0' }"
      :body-style="{ padding: '17px 20px 21px 20px' }"
    >
      <template #title> 主要分类内容 </template>
      <template #extra>
        <a-link @click="router.push('/category/list')">查看更多</a-link>
      </template>
      <a-space direction="vertical" fill>
        <a-radio-group v-model:model-value="type" type="button" @change="typeChange">
          <a-radio v-for="(item, index) in categoryOptions" :key="index" :value="item.id">
            {{ item.value }}
          </a-radio>
        </a-radio-group>
        <a-table
          :data="renderList"
          :pagination="false"
          :bordered="false"
          :scroll="{ x: '100%', y: '264px' }"
        >
          <template #columns>
            <a-table-column title="文章标题" data-index="title">
              <template #cell="{ record }">
                <a-typography-paragraph
                  :ellipsis="{
                    rows: 1,
                  }"
                >
                  {{ record.title }}
                </a-typography-paragraph>
              </template>
            </a-table-column>
            <a-table-column title="浏览量" data-index="views" :width="80" />

            <a-table-column title="点赞数" data-index="likes" :width="80" />
          </template>
        </a-table>
      </a-space>
    </a-card>
  </a-spin>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import useLoading from '@/hooks/loading';
  import type { TableData } from '@arco-design/web-vue/es/table/interface';
  import { getAllCategory } from '@/api/category';
  import { getArticleList } from '@/api/article';
  import type { ListState } from '@/types/global';

  const router = useRouter();
  const type = ref('');
  const categoryOptions = ref<ListState[]>();
  const { loading, setLoading } = useLoading();
  const renderList = ref<TableData[]>();
  const fetchData = async (contentType?: string) => {
    try {
      setLoading(true);
      const options = await getAllCategory({ isDelete: true });
      categoryOptions.value = options.slice(0, 5);
      if (!contentType) {
        type.value = options[0]?.id;
      }
      const { list } = await getArticleList({
        category: contentType || type.value,
        client: true,
        sort: 'DESC',
      });
      renderList.value = list;
    } catch (err) {
      // you can report use errorHandler or other
    } finally {
      setLoading(false);
    }
  };
  const typeChange: any = (contentType: string) => {
    fetchData(contentType);
  };
  fetchData();
</script>

<style scoped lang="less">
  .general-card {
    min-height: 395px;
  }

  :deep(.arco-table-tr) {
    height: 44px;

    .arco-typography {
      margin-bottom: 0;
    }
  }

  :deep(.arco-radio-group-button) {
    width: 100%;

    .arco-radio-button {
      margin: auto;
    }
  }

  .increases-cell {
    display: flex;
    align-items: center;

    span {
      margin-right: 4px;
    }
  }
</style>
