<template>
  <div class="container">
    <a-card class="general-card" title="RPG统计概览" style="margin-bottom: 16px">
      <a-spin :loading="statsLoading" style="width: 100%">
        <a-row :gutter="16">
          <a-col :span="6" v-for="item in statsItems" :key="item.key">
            <a-statistic
              :title="item.title"
              :value="stats[item.key] ?? 0"
              :value-style="{ fontSize: '20px', fontWeight: 600 }"
            />
          </a-col>
        </a-row>
      </a-spin>
    </a-card>

    <a-card class="general-card" title="用户RPG数据">
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
                <a-form-item label="搜索用户">
                  <a-input
                    v-model="formModel.keyword"
                    placeholder="昵称/用户名"
                    @press-enter="search"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="排序字段">
                  <a-select v-model="formModel.sortBy">
                    <a-option value="level">等级</a-option>
                    <a-option value="exp">经验值</a-option>
                    <a-option value="totalSignDays">签到天数</a-option>
                    <a-option value="consecutiveSignDays">连续签到</a-option>
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
              搜索
            </a-button>
            <a-button @click="reset">
              <template #icon><icon-refresh /></template>
              重置
            </a-button>
          </a-space>
        </a-col>
      </a-row>

      <a-divider style="margin-top: 0" />

      <a-table
        :loading="loading"
        row-key="id"
        :pagination="false"
        :data="tableData"
        :bordered="false"
        scrollbar
        :scroll="{ x: 1200, y: 600 }"
      >
        <template #columns>
          <a-table-column title="用户ID" data-index="uid" :width="70" />
          <a-table-column title="昵称" :width="120">
            <template #cell="{ record }">
              {{ record.nickname || record.username || '-' }}
            </template>
          </a-table-column>
          <a-table-column title="等级" data-index="level" :width="70" align="center">
            <template #cell="{ record }">
              <a-tag color="blue">LV{{ record.level }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="经验值" data-index="exp" :width="90" align="center" />
          <a-table-column title="生命值" data-index="lifeValue" :width="80" align="center">
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
          <a-table-column title="累计签到" data-index="totalSignDays" :width="90" align="center" />
          <a-table-column
            title="连续签到"
            data-index="consecutiveSignDays"
            :width="90"
            align="center"
          />
          <a-table-column
            title="敏感词命中"
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
          <a-table-column title="抽奖券" data-index="lotteryTickets" :width="80" align="center" />
          <a-table-column title="钻石" data-index="currency" :width="80" align="center" />
          <a-table-column title="禁言状态" :width="90">
            <template #cell="{ record }">
              <a-tag :color="isBanned(record) ? 'red' : 'green'">
                {{ isBanned(record) ? '禁言中' : '正常' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="操作" data-index="operations" :width="140" fixed="right">
            <template #cell="{ record }">
              <a-space :size="4">
                <a-button size="mini" type="primary" @click="showDetail(record)">
                  <icon-eye />
                </a-button>
                <a-button
                  v-if="isSuperAdmin"
                  size="mini"
                  type="outline"
                  status="warning"
                  @click="openRecharge(record)"
                >
                  充值
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

    <a-modal
      v-model:visible="detailVisible"
      title="用户RPG详情"
      :width="960"
      :footer="false"
      :body-style="{ maxHeight: '70vh', overflow: 'auto', padding: '16px 20px' }"
    >
      <a-spin :loading="detailLoading" style="width: 100%">
        <template v-if="detailData">
          <a-descriptions
            title="用户概览"
            :column="4"
            bordered
            size="small"
            style="margin-bottom: 12px"
          >
            <a-descriptions-item label="UID">{{ detailData.uid }}</a-descriptions-item>
            <a-descriptions-item label="昵称">{{
              detailData.user?.nickname || detailData.user?.username || '-'
            }}</a-descriptions-item>
            <a-descriptions-item label="Email">{{
              detailData.user?.email || '-'
            }}</a-descriptions-item>
            <a-descriptions-item label="禁言状态">
              <a-tag :color="isBanned(detailData) ? 'red' : 'green'" size="small">
                {{ isBanned(detailData) ? '禁言中' : '正常' }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="等级">LV{{ detailData.level }}</a-descriptions-item>
            <a-descriptions-item label="经验值">{{ detailData.exp }}</a-descriptions-item>
            <a-descriptions-item label="生命值">{{ detailData.lifeValue }}</a-descriptions-item>
            <a-descriptions-item label="抽奖券">{{
              detailData.lotteryTickets
            }}</a-descriptions-item>
            <a-descriptions-item label="钻石">{{ detailData.currency ?? 0 }}</a-descriptions-item>
            <a-descriptions-item label="累计签到">{{
              detailData.totalSignDays
            }}</a-descriptions-item>
            <a-descriptions-item label="连续签到">{{
              detailData.consecutiveSignDays
            }}</a-descriptions-item>
            <a-descriptions-item label="敏感词命中">{{
              detailData.sensitiveHitsCount
            }}</a-descriptions-item>
          </a-descriptions>

          <h4 style="margin-bottom: 8px">成就进度 ({{ detailData.achievements?.length || 0 }})</h4>
          <a-table
            :data="detailData.achievements || []"
            :pagination="false"
            size="small"
            :bordered="false"
            :scroll="{ y: 200 }"
            style="margin-bottom: 12px"
          >
            <template #columns>
              <a-table-column title="名称" data-index="name" :width="120" ellipsis tooltip />
              <a-table-column title="编码" data-index="achievementCode" :width="130" ellipsis />
              <a-table-column title="进度" :width="100" align="center">
                <template #cell="{ record }">
                  {{ record.progress }}/{{ record.maxProgress }}
                </template>
              </a-table-column>
              <a-table-column title="经验奖励" data-index="expReward" :width="90" align="center" />
              <a-table-column title="已完成" :width="80" align="center">
                <template #cell="{ record }">
                  <a-tag :color="record.completed ? 'green' : 'gray'" size="small">
                    {{ record.completed ? '✓' : '✗' }}
                  </a-tag>
                </template>
              </a-table-column>
              <a-table-column title="完成时间" :width="160">
                <template #cell="{ record }">
                  {{
                    record.completedAt ? $dayjs(record.completedAt).format('YYYY-MM-DD HH:mm') : '-'
                  }}
                </template>
              </a-table-column>
            </template>
          </a-table>

          <h4 style="margin-bottom: 8px">今日任务 ({{ detailData.questProgress?.length || 0 }})</h4>
          <a-table
            :data="detailData.questProgress || []"
            :pagination="false"
            size="small"
            :bordered="false"
            :scroll="{ y: 200 }"
          >
            <template #columns>
              <a-table-column title="名称" data-index="name" :width="120" ellipsis tooltip />
              <a-table-column title="编码" data-index="questCode" :width="130" ellipsis />
              <a-table-column title="进度" :width="100" align="center">
                <template #cell="{ record }">
                  {{ record.progress }}/{{ record.targetCount }}
                </template>
              </a-table-column>
              <a-table-column title="经验奖励" data-index="expReward" :width="90" align="center" />
              <a-table-column title="已完成" :width="80" align="center">
                <template #cell="{ record }">
                  <a-tag :color="record.completed ? 'green' : 'gray'" size="small">{{
                    record.completed ? '✓' : '✗'
                  }}</a-tag>
                </template>
              </a-table-column>
              <a-table-column title="已领取" :width="80" align="center">
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

    <a-modal
      v-model:visible="rechargeVisible"
      title="充值钻石"
      :ok-loading="rechargeLoading"
      @ok="submitRecharge"
      @cancel="rechargeVisible = false"
    >
      <a-form :model="rechargeForm" layout="vertical">
        <a-form-item label="用户">
          <span>{{ rechargeForm.nickname || rechargeForm.uid }}</span>
        </a-form-item>
        <a-form-item label="充值数量" required>
          <a-input-number
            v-model="rechargeForm.amount"
            :min="1"
            :max="100000"
            placeholder="1~100000"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="备注">
          <a-input v-model="rechargeForm.reason" placeholder="可选，如：测试充值" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, computed } from 'vue';
  import type { Pagination } from '@/types/global';
  import { IconSearch, IconRefresh, IconEye } from '@arco-design/web-vue/es/icon';
  import { Message } from '@arco-design/web-vue';
  import { getUserRpgList, getUserRpgDetail, getRpgStats, rechargeDiamonds } from '@/api/rpg';
  import useLoading from '@/hooks/loading';
  import useUserStore from '@/store/modules/user';

  const userStore = useUserStore();
  const isSuperAdmin = computed(() => userStore.roles?.some((r: { id: number }) => r.id === 1));

  const statsItems = [
    { key: 'totalPlayers', title: '总玩家数' },
    { key: 'avgLevel', title: '平均等级' },
    { key: 'avgExp', title: '平均经验' },
    { key: 'totalSignDays', title: '总签到天数' },
    { key: 'bannedCount', title: '禁言用户' },
    { key: 'achievementCount', title: '启用成就数' },
    { key: 'questCount', title: '启用任务数' },
    { key: 'poolCount', title: '奖池物品数' },
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
  const { loading, setLoading } = useLoading(true);

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

  const onPageSizeChange = (pageSize: number) => {
    formModel.value.page = 1;
    formModel.value.pageSize = pageSize;
    pagination.current = 1;
    pagination.pageSize = pageSize;
    loadData();
  };

  const detailVisible = ref(false);
  const detailLoading = ref(false);
  const detailData = ref<any>(null);

  const rechargeVisible = ref(false);
  const rechargeLoading = ref(false);
  const rechargeForm = reactive({
    uid: 0,
    nickname: '',
    amount: 100,
    reason: 'admin_test',
  });

  const openRecharge = (record: any) => {
    rechargeForm.uid = record.uid;
    rechargeForm.nickname = record.nickname || record.username || String(record.uid);
    rechargeForm.amount = 100;
    rechargeForm.reason = 'admin_test';
    rechargeVisible.value = true;
  };

  const submitRecharge = async () => {
    if (!rechargeForm.amount || rechargeForm.amount < 1) {
      Message.warning('请输入有效充值数量');
      return;
    }
    rechargeLoading.value = true;
    try {
      await rechargeDiamonds(rechargeForm.uid, {
        amount: rechargeForm.amount,
        reason: rechargeForm.reason,
      });
      Message.success('充值成功');
      rechargeVisible.value = false;
      loadData();
    } finally {
      rechargeLoading.value = false;
    }
  };

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
