<template>
  <div class="container">
    <!-- 统计概览 -->
    <a-card class="general-card" :title="t('rpgStats.title')" style="margin-bottom: 16px">
      <a-spin :loading="statsLoading" style="width: 100%">
        <a-row :gutter="16">
          <a-col :span="3" v-for="item in statsItems" :key="item.key">
            <a-statistic
              :title="t(item.titleKey)"
              :value="stats[item.key] ?? 0"
              :value-style="{ fontSize: '20px', fontWeight: 600 }"
            />
          </a-col>
        </a-row>
      </a-spin>
    </a-card>

    <!-- 用户列表 -->
    <a-card class="general-card" :title="t('rpgUser.query.title')">
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
                <a-form-item :label="t('rpgUser.form.keyword')">
                  <a-input
                    v-model="formModel.keyword"
                    :placeholder="t('rpgUser.form.placeholder.keyword')"
                    @press-enter="search"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item :label="t('rpgUser.form.sortBy')">
                  <a-select v-model="formModel.sortBy">
                    <a-option value="level">{{ t('rpgUser.form.sortBy.level') }}</a-option>
                    <a-option value="exp">{{ t('rpgUser.form.sortBy.exp') }}</a-option>
                    <a-option value="totalSignDays">{{
                      t('rpgUser.form.sortBy.totalSignDays')
                    }}</a-option>
                    <a-option value="consecutiveSignDays">{{
                      t('rpgUser.form.sortBy.consecutiveSignDays')
                    }}</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-col>
        <a-col :span="5" style="text-align: right">
          <a-space :size="8">
            <a-button type="primary" @click="search">
              <template #icon><icon-search /></template>
              {{ t('rpgUser.button.search') }}
            </a-button>
            <a-button @click="reset">
              <template #icon><icon-refresh /></template>
              {{ t('rpgUser.button.reset') }}
            </a-button>
          </a-space>
        </a-col>
      </a-row>

      <a-divider style="margin-top: 0" />

      <a-table
        :loading="loading"
        row-key="id"
        :pagination="pagination"
        :data="tableData"
        :bordered="false"
        @page-change="onPageChange"
      >
        <template #columns>
          <a-table-column :title="t('rpgUser.table.uid')" data-index="uid" :width="70" />
          <a-table-column :title="t('rpgUser.table.nickname')" :width="120">
            <template #cell="{ record }">
              {{ record.nickname || record.username || '-' }}
            </template>
          </a-table-column>
          <a-table-column
            :title="t('rpgUser.table.level')"
            data-index="level"
            :width="70"
            align="center"
          >
            <template #cell="{ record }">
              <a-tag color="blue">LV{{ record.level }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column
            :title="t('rpgUser.table.exp')"
            data-index="exp"
            :width="90"
            align="center"
          />
          <a-table-column
            :title="t('rpgUser.table.lifeValue')"
            data-index="lifeValue"
            :width="80"
            align="center"
          >
            <template #cell="{ record }">
              <span
                :style="{
                  color:
                    record.lifeValue <= 30
                      ? '#ef4444'
                      : record.lifeValue <= 60
                        ? '#f59e0b'
                        : '#22c55e',
                }"
              >
                {{ record.lifeValue }}
              </span>
            </template>
          </a-table-column>
          <a-table-column
            :title="t('rpgUser.table.totalSignDays')"
            data-index="totalSignDays"
            :width="90"
            align="center"
          />
          <a-table-column
            :title="t('rpgUser.table.consecutiveSignDays')"
            data-index="consecutiveSignDays"
            :width="90"
            align="center"
          />
          <a-table-column
            :title="t('rpgUser.table.sensitiveHitsCount')"
            data-index="sensitiveHitsCount"
            :width="100"
            align="center"
          >
            <template #cell="{ record }">
              <span :style="{ color: record.sensitiveHitsCount > 0 ? '#ef4444' : undefined }">
                {{ record.sensitiveHitsCount }}
              </span>
            </template>
          </a-table-column>
          <a-table-column
            :title="t('rpgUser.table.lotteryTickets')"
            data-index="lotteryTickets"
            :width="80"
            align="center"
          />
          <a-table-column :title="t('rpgUser.table.banStatus')" :width="90">
            <template #cell="{ record }">
              <a-tag :color="isBanned(record) ? 'red' : 'green'">
                {{
                  isBanned(record)
                    ? t('rpgUser.table.banStatus.banned')
                    : t('rpgUser.table.banStatus.normal')
                }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column :title="t('rpgUser.table.operation')" data-index="operations" :width="80">
            <template #cell="{ record }">
              <a-button size="mini" type="text" @click="showDetail(record)">
                {{ t('rpgUser.button.detail') }}
              </a-button>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 用户详情弹窗 -->
    <a-modal
      v-model:visible="detailVisible"
      :title="t('rpgUser.detail.title')"
      :width="720"
      :footer="false"
    >
      <a-spin :loading="detailLoading" style="width: 100%">
        <template v-if="detailData">
          <a-descriptions
            :title="t('rpgUser.detail.basicInfo')"
            :column="3"
            bordered
            size="small"
            style="margin-bottom: 16px"
          >
            <a-descriptions-item label="UID">{{ detailData.uid }}</a-descriptions-item>
            <a-descriptions-item :label="t('rpgUser.table.nickname')">{{
              detailData.user?.nickname || detailData.user?.username || '-'
            }}</a-descriptions-item>
            <a-descriptions-item label="Email">{{
              detailData.user?.email || '-'
            }}</a-descriptions-item>
          </a-descriptions>

          <a-descriptions
            :title="t('rpgUser.detail.rpgData')"
            :column="4"
            bordered
            size="small"
            style="margin-bottom: 16px"
          >
            <a-descriptions-item :label="t('rpgUser.table.level')"
              >LV{{ detailData.level }}</a-descriptions-item
            >
            <a-descriptions-item :label="t('rpgUser.table.exp')">{{
              detailData.exp
            }}</a-descriptions-item>
            <a-descriptions-item :label="t('rpgUser.table.lifeValue')">{{
              detailData.lifeValue
            }}</a-descriptions-item>
            <a-descriptions-item :label="t('rpgUser.table.lotteryTickets')">{{
              detailData.lotteryTickets
            }}</a-descriptions-item>
            <a-descriptions-item :label="t('rpgUser.table.totalSignDays')">{{
              detailData.totalSignDays
            }}</a-descriptions-item>
            <a-descriptions-item :label="t('rpgUser.table.consecutiveSignDays')">{{
              detailData.consecutiveSignDays
            }}</a-descriptions-item>
            <a-descriptions-item :label="t('rpgUser.table.sensitiveHitsCount')">{{
              detailData.sensitiveHitsCount
            }}</a-descriptions-item>
            <a-descriptions-item :label="t('rpgUser.table.banStatus')">
              <a-tag :color="isBanned(detailData) ? 'red' : 'green'" size="small">
                {{
                  isBanned(detailData)
                    ? t('rpgUser.table.banStatus.banned')
                    : t('rpgUser.table.banStatus.normal')
                }}
              </a-tag>
            </a-descriptions-item>
          </a-descriptions>

          <h4 style="margin-bottom: 8px"
            >{{ t('rpgUser.detail.achievements') }} ({{ detailData.achievements?.length || 0 }})</h4
          >
          <a-table
            v-if="detailData.achievements?.length"
            :data="detailData.achievements"
            :pagination="false"
            size="small"
            :bordered="false"
            style="margin-bottom: 16px"
          >
            <template #columns>
              <a-table-column title="Code" data-index="achievementCode" :width="150" />
              <a-table-column title="Progress" data-index="progress" :width="80" align="center" />
              <a-table-column title="Completed" :width="80" align="center">
                <template #cell="{ record }">
                  <a-tag :color="record.completed ? 'green' : 'gray'" size="small">
                    {{ record.completed ? '✓' : '✗' }}
                  </a-tag>
                </template>
              </a-table-column>
            </template>
          </a-table>

          <h4 style="margin-bottom: 8px"
            >{{ t('rpgUser.detail.questProgress') }} ({{
              detailData.questProgress?.length || 0
            }})</h4
          >
          <a-table
            v-if="detailData.questProgress?.length"
            :data="detailData.questProgress"
            :pagination="false"
            size="small"
            :bordered="false"
          >
            <template #columns>
              <a-table-column title="Code" data-index="questCode" :width="150" />
              <a-table-column title="Progress" data-index="progress" :width="80" align="center" />
              <a-table-column title="Completed" :width="80" align="center">
                <template #cell="{ record }">
                  <a-tag :color="record.completed ? 'green' : 'gray'" size="small">{{
                    record.completed ? '✓' : '✗'
                  }}</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="Claimed" :width="80" align="center">
                <template #cell="{ record }">
                  <a-tag :color="record.claimed ? 'blue' : 'gray'" size="small">{{
                    record.claimed ? '✓' : '✗'
                  }}</a-tag>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </template>
      </a-spin>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import { useI18n } from 'vue-i18n';
  import type { Pagination } from '@/types/global';
  import { IconSearch, IconRefresh } from '@arco-design/web-vue/es/icon';
  import { getUserRpgList, getUserRpgDetail, getRpgStats } from '@/api/rpg';
  import useLoading from '@/hooks/loading';

  const { t } = useI18n();
  const { loading, setLoading } = useLoading(true);

  const statsItems = [
    { key: 'totalPlayers', titleKey: 'rpgStats.totalPlayers' },
    { key: 'avgLevel', titleKey: 'rpgStats.avgLevel' },
    { key: 'avgExp', titleKey: 'rpgStats.avgExp' },
    { key: 'totalSignDays', titleKey: 'rpgStats.totalSignDays' },
    { key: 'bannedCount', titleKey: 'rpgStats.bannedCount' },
    { key: 'achievementCount', titleKey: 'rpgStats.achievementCount' },
    { key: 'questCount', titleKey: 'rpgStats.questCount' },
    { key: 'poolCount', titleKey: 'rpgStats.poolCount' },
  ];
  const statsLoading = ref(true);
  const stats = ref<Record<string, any>>({});

  const loadStats = async () => {
    statsLoading.value = true;
    try {
      const res: any = await getRpgStats();
      stats.value = res.data;
    } finally {
      statsLoading.value = false;
    }
  };

  loadStats();

  const generateFormModel = () => ({
    keyword: '',
    sortBy: 'level',
    page: 1,
    pageSize: 20,
  });

  const formModel = ref(generateFormModel());
  const tableData = ref<any[]>([]);
  const basePagination: Pagination = { current: 1, pageSize: 20, total: 0 };
  const pagination = reactive({ ...basePagination });

  const isBanned = (record: any) => {
    if (!record.banEndTime) return false;
    return new Date(record.banEndTime) > new Date();
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res: any = await getUserRpgList(formModel.value);
      tableData.value = res.data.list;
      pagination.total = res.data.pagination.total;
    } finally {
      setLoading(false);
    }
  };

  loadData();

  const search = () => {
    formModel.value.page = 1;
    pagination.current = 1;
    loadData();
  };

  const reset = () => {
    formModel.value = generateFormModel();
    pagination.current = 1;
    loadData();
  };

  const onPageChange = (current: number) => {
    formModel.value.page = current;
    pagination.current = current;
    loadData();
  };

  // 详情
  const detailVisible = ref(false);
  const detailLoading = ref(false);
  const detailData = ref<any>(null);

  const showDetail = async (record: any) => {
    detailVisible.value = true;
    detailLoading.value = true;
    detailData.value = null;
    try {
      const res: any = await getUserRpgDetail(record.uid);
      detailData.value = res.data;
    } finally {
      detailLoading.value = false;
    }
  };
</script>

<script lang="ts">
  export default { name: 'RpgUserTable' };
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
