<template>
  <a-card
    class="general-card"
    :title="t('workplace.recentArticles')"
    :header-style="{ paddingBottom: '0' }"
    :body-style="{ padding: '15px 20px 13px 20px' }"
  >
    <template #extra>
      <a-link>
        <router-link to="/article/list">{{ t('workplace.viewMore') }}</router-link>
      </a-link>
    </template>
    <div>
      <div v-for="(item, idx) in list" :key="idx" class="item" @click="clickItem(item.id)">
        <a-tag :color="item.type" size="small">{{ item.label }}</a-tag>
        <span class="item-content">
          {{ item.content }}
        </span>
      </div>
    </div>
  </a-card>
</template>

<script lang="ts" setup>
  import { useUserStore } from '@/store';
  import { getArticleList } from '@/api/article';
  import { ref } from 'vue';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  const { role } = useUserStore();

  const list = ref<any>([]);
  const types = ['orangered', 'cyan', 'blue', 'blue', 'cyan'];
  const getArticleListHandle = async () => {
    const onlyMy = role === 'author'; // 作者只返回自身文章
    const params = {
      onlyMy,
      page: 1,
      pageSize: 5,
    };
    const res = await getArticleList(params);
    list.value = res.list.map((v: any, i: number) => {
      v.label = v.category.label;
      v.content = v.title;
      v.type = types[i];
      return v;
    });
  };
  getArticleListHandle();
  const clickItem = (id: string) => {
    window.open(`https://jiang-xia.top/detail/${id}`);
  };
</script>

<style scoped lang="less">
  .item {
    display: flex;
    align-items: center;
    width: 100%;
    height: 24px;
    margin-bottom: 4px;

    .item-content {
      flex: 1;
      margin-left: 4px;
      overflow: hidden;
      color: var(--color-text-2);
      font-size: 13px;
      white-space: nowrap;
      text-decoration: none;
      text-overflow: ellipsis;
      cursor: pointer;
    }

    :deep(.arco-tag) {
      justify-content: center;
      width: 50px;
    }
  }
</style>
