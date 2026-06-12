<template>
  <div class="container">
    <a-card class="general-card" title="打赏与社交流水">
      <a-tabs v-model:active-key="activeTab" @change="onTabChange">
        <a-tab-pane key="tips" title="打赏流水">
          <a-table
            row-key="id"
            :loading="loading"
            :data="tipData"
            :pagination="tipPagination"
            @page-change="onTipPageChange"
          >
            <template #columns>
              <a-table-column title="ID" data-index="id" />
              <a-table-column title="文章ID" data-index="articleId" />
              <a-table-column title="打赏者" data-index="fromUid" :width="140">
                <template #cell="{ record }">
                  <div>{{ record.fromUid }}</div>
                  <div class="user-name">{{ formatUserName(record, 'from') }}</div>
                </template>
              </a-table-column>
              <a-table-column title="作者" data-index="toUid" :width="140">
                <template #cell="{ record }">
                  <div>{{ record.toUid }}</div>
                  <div class="user-name">{{ formatUserName(record, 'to') }}</div>
                </template>
              </a-table-column>
              <a-table-column title="碎片" data-index="amount" />
              <a-table-column title="时间" data-index="createTime" :width="170">
                <template #cell="{ record }">
                  {{
                    record.createTime
                      ? $dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss')
                      : '-'
                  }}
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-tab-pane>
        <a-tab-pane key="social" title="社交流水">
          <a-table
            row-key="id"
            :loading="loading"
            :data="socialData"
            :pagination="socialPagination"
            @page-change="onSocialPageChange"
          >
            <template #columns>
              <a-table-column title="ID" data-index="id" />
              <a-table-column title="发起者" data-index="fromUid" :width="140">
                <template #cell="{ record }">
                  <div>{{ record.fromUid }}</div>
                  <div class="user-name">{{ formatUserName(record, 'from') }}</div>
                </template>
              </a-table-column>
              <a-table-column title="目标" data-index="toUid" :width="140">
                <template #cell="{ record }">
                  <div>{{ record.toUid }}</div>
                  <div class="user-name">{{ formatUserName(record, 'to') }}</div>
                </template>
              </a-table-column>
              <a-table-column title="动作" data-index="action">
                <template #cell="{ record }">
                  <a-tag>{{ socialActionLabel(record.action) }}</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="消耗碎片" data-index="costFragments" />
              <a-table-column title="生命变化" data-index="hpDelta" />
              <a-table-column title="时间" data-index="createTime" :width="170">
                <template #cell="{ record }">
                  {{
                    record.createTime
                      ? $dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss')
                      : '-'
                  }}
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import type { Pagination } from '@/types/global';
  import { getTipLogList, getSocialLogList } from '@/api/rpg';
  import useLoading from '@/hooks/loading';

  const SOCIAL_ACTION_LABELS: Record<string, string> = {
    cheer: '加油',
    egg: '扔鸡蛋',
    flower: '送鲜花',
  };
  const socialActionLabel = (action: string) => SOCIAL_ACTION_LABELS[action] || action;

  const formatUserName = (record: any, prefix: 'from' | 'to') => {
    const nickname = record[`${prefix}Nickname`];
    const username = record[`${prefix}Username`];
    return nickname || username || '-';
  };

  const { loading, setLoading } = useLoading(true);
  const activeTab = ref('tips');
  const tipData = ref<any[]>([]);
  const socialData = ref<any[]>([]);
  const tipPage = ref(1);
  const socialPage = ref(1);
  const basePagination: Pagination = { current: 1, pageSize: 20, total: 0 };
  const tipPagination = reactive({ ...basePagination });
  const socialPagination = reactive({ ...basePagination });

  const loadTips = async () => {
    setLoading(true);
    try {
      const res: any = await getTipLogList({ page: tipPage.value, pageSize: 20 });
      tipData.value = res.data.list;
      tipPagination.total = res.data.pagination.total;
      tipPagination.current = tipPage.value;
    } finally {
      setLoading(false);
    }
  };

  const loadSocial = async () => {
    setLoading(true);
    try {
      const res: any = await getSocialLogList({ page: socialPage.value, pageSize: 20 });
      socialData.value = res.data.list;
      socialPagination.total = res.data.pagination.total;
      socialPagination.current = socialPage.value;
    } finally {
      setLoading(false);
    }
  };

  loadTips();

  const onTabChange = (key: string | number) => {
    if (key === 'social' && socialData.value.length === 0) loadSocial();
  };

  const onTipPageChange = (current: number) => {
    tipPage.value = current;
    loadTips();
  };
  const onSocialPageChange = (current: number) => {
    socialPage.value = current;
    loadSocial();
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
</style>
