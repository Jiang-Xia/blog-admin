<template>
  <div class="container">
    <a-card class="general-card" title="RAG 知识库管理">
      <template #extra>
        <a-button :loading="refreshing" @click="handleRefreshAll">
          <template #icon><icon-refresh /></template>
          刷新
        </a-button>
      </template>

      <a-tabs v-model:active-key="activeTab" @change="onTabChange">
        <a-tab-pane key="stats" title="统计概览">
          <a-spin :loading="statsLoading && !statsSilent">
            <a-alert
              v-if="showLocalEmbeddingNotConfigured"
              type="warning"
              style="margin-bottom: 16px"
            >
              <div class="embedding-alert-title"
                >当前为「本地向量」模式（未配置远程 Embedding）</div
              >
              <div class="embedding-alert-body">
                未配置
                <code>rag_embedding_api_key</code>
                与
                <code>rag_embedding_api_base_url</code>
                （或仅配 DeepSeek 问答 Key 而无 SiliconFlow 地址）时，系统用简单 hash 生成 384
                维向量，<strong>不理解语义</strong>。
              </div>
              <div class="embedding-alert-body">
                问答仍走 DeepSeek。请配置 SiliconFlow Key 并<strong>重启 blog-server</strong>
                后全量重建：
                <a href="https://cloud.siliconflow.cn/account/ak" target="_blank" rel="noopener">
                  申请 Embedding Key
                </a>
              </div>
            </a-alert>

            <a-alert
              v-else-if="showLocalEmbeddingDegraded"
              type="warning"
              style="margin-bottom: 16px"
            >
              <div class="embedding-alert-title"
                >Embedding 已配置，但进程当前运行在「本地回退」</div
              >
              <div class="embedding-alert-body">
                环境变量里已有远程 Embedding 配置，但本次进程曾调用 SiliconFlow
                失败，已自动降级为本地 hash（刷新页面不会恢复）。
              </div>
              <div class="embedding-alert-body">
                请查看 blog-server 日志中的
                <code>Embedding API failed</code>
                ，确认 Key 余额/模型名无误后<strong>重启服务</strong>并全量重建索引。
              </div>
            </a-alert>

            <a-alert
              v-else-if="stats?.embeddingMode === 'remote'"
              type="success"
              style="margin-bottom: 16px"
            >
              向量模式：<strong>远程 API</strong>（{{
                stats?.embeddingModel || '-'
              }}），检索质量正常。 修改 Embedding 配置后需重启服务并全量重建索引。
            </a-alert>

            <a-alert v-if="stats?.indexing" type="warning" style="margin-bottom: 16px">
              索引任务进行中，完成后知识块数会自动更新。
            </a-alert>

            <a-alert v-else-if="lastJobFailed" type="error" style="margin-bottom: 16px">
              最近一次索引失败：{{ stats?.lastJob?.errorMsg || '未知错误' }}
            </a-alert>

            <div class="stats-overview">
              <div v-for="item in overviewStatItems" :key="item.key" class="stat-card">
                <div class="stat-card__label">{{ item.label }}</div>
                <div
                  class="stat-card__value"
                  :class="{ 'stat-card__value--text': item.type === 'text' }"
                  :title="String(item.value)"
                >
                  {{ item.value }}
                </div>
              </div>
            </div>

            <a-row :gutter="16" class="stats-detail-row">
              <a-col :xs="24" :lg="12">
                <div class="stats-panel">
                  <h4 class="stats-panel__title">近7日趋势</h4>
                  <a-table
                    :data="stats?.dailyTrend || []"
                    :pagination="false"
                    size="small"
                    row-key="date"
                  >
                    <template #empty>
                      <a-empty description="暂无问答记录" />
                    </template>
                    <template #columns>
                      <a-table-column title="日期" data-index="date">
                        <template #cell="{ record }">
                          {{ formatDate(record.date) }}
                        </template>
                      </a-table-column>
                      <a-table-column title="问答次数" data-index="count" />
                    </template>
                  </a-table>
                </div>
              </a-col>
              <a-col :xs="24" :lg="12">
                <div class="stats-panel">
                  <h4 class="stats-panel__title">Top 用户（7日）</h4>
                  <a-table
                    :data="stats?.topUsers || []"
                    :pagination="false"
                    size="small"
                    row-key="uid"
                  >
                    <template #empty>
                      <a-empty description="暂无数据" />
                    </template>
                    <template #columns>
                      <a-table-column title="UID" data-index="uid" />
                      <a-table-column title="次数" data-index="count" />
                    </template>
                  </a-table>
                </div>
              </a-col>
            </a-row>
          </a-spin>
        </a-tab-pane>

        <a-tab-pane key="logs" title="查询日志">
          <a-form :model="logQuery" layout="inline" style="margin-bottom: 16px">
            <a-form-item label="UID">
              <a-input
                v-model="logQuery.uid"
                allow-clear
                style="width: 120px"
                placeholder="用户 ID"
                @press-enter="handleLogSearch"
              />
            </a-form-item>
            <a-form-item>
              <a-space>
                <a-button type="primary" :loading="logsLoading" @click="handleLogSearch">
                  搜索
                </a-button>
                <a-button @click="handleLogReset">重置</a-button>
              </a-space>
            </a-form-item>
          </a-form>
          <a-table
            row-key="id"
            :loading="logsLoading"
            :data="logData"
            :pagination="false"
            scrollbar
            :scroll="{ x: 900, y: 500 }"
          >
            <template #empty>
              <a-empty description="暂无查询日志" />
            </template>
            <template #columns>
              <a-table-column title="ID" data-index="id" :width="80" />
              <a-table-column title="UID" data-index="uid" :width="80" />
              <a-table-column title="问题" data-index="question" :width="220" ellipsis />
              <a-table-column title="状态" data-index="status" :width="110">
                <template #cell="{ record }">
                  <a-tag :color="queryStatusColor(record.status)">
                    {{ queryStatusLabel(record.status) }}
                  </a-tag>
                </template>
              </a-table-column>
              <a-table-column title="耗时ms" data-index="latencyMs" :width="90" />
              <a-table-column title="时间" data-index="createAt" :width="170">
                <template #cell="{ record }">
                  {{ formatTime(record.createAt) }}
                </template>
              </a-table-column>
            </template>
          </a-table>
          <TablePagination
            :total="logPagination.total"
            :current="logPagination.current"
            :page-size="logPagination.pageSize"
            @change="onLogPageChange"
            @page-size-change="onLogPageSizeChange"
          />
        </a-tab-pane>

        <a-tab-pane key="index" title="索引管理">
          <a-alert type="info" style="margin-bottom: 16px">
            全量重建会重新向量化全部已发布文章；单篇重建适用于某篇文章更新后。Embedding
            配置变更后必须先重启 blog-server。
          </a-alert>

          <a-space style="margin-bottom: 16px" wrap>
            <a-button
              type="primary"
              :loading="reindexLoading"
              :disabled="stats?.indexing"
              @click="handleFullReindex"
            >
              全量重建索引
            </a-button>
            <a-input-number
              v-model="reindexArticleId"
              placeholder="文章 ID"
              :min="1"
              style="width: 140px"
            />
            <a-button
              :loading="reindexLoading"
              :disabled="stats?.indexing"
              @click="handleArticleReindex"
            >
              单篇重建
            </a-button>
          </a-space>

          <a-alert v-if="stats?.indexing" type="warning" style="margin-bottom: 12px">
            索引任务进行中（约每 3 秒自动刷新），请勿重复触发全量重建。
          </a-alert>

          <a-table
            row-key="id"
            :loading="jobsLoading"
            :data="jobData"
            :pagination="false"
            scrollbar
            :scroll="{ x: 760, y: 400 }"
          >
            <template #empty>
              <a-empty description="暂无索引任务" />
            </template>
            <template #columns>
              <a-table-column title="ID" data-index="id" :width="80" />
              <a-table-column title="文章ID" data-index="articleId" :width="90">
                <template #cell="{ record }">
                  {{ record.articleId === 0 ? '全量' : record.articleId }}
                </template>
              </a-table-column>
              <a-table-column title="状态" data-index="status" :width="110">
                <template #cell="{ record }">
                  <a-tag :color="jobStatusColor(record.status)">
                    {{ jobStatusLabel(record.status) }}
                  </a-tag>
                </template>
              </a-table-column>
              <a-table-column title="块数" data-index="chunkCount" :width="80" />
              <a-table-column title="错误" data-index="errorMsg" ellipsis />
              <a-table-column title="时间" data-index="createAt" :width="170">
                <template #cell="{ record }">
                  {{ formatTime(record.createAt) }}
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, onUnmounted, computed } from 'vue';
  import { Message, Modal } from '@arco-design/web-vue';
  import { IconRefresh } from '@arco-design/web-vue/es/icon';
  import dayjs from 'dayjs';
  import TablePagination from '@/components/table-pagination/index.vue';
  import { assertApiOk, getApiErrorMessage } from '@/utils/api-response';
  import { getRagStats, getRagQueryLogs, getRagIndexJobs, triggerRagReindex } from '@/api/rag';

  const activeTab = ref('stats');
  const statsLoading = ref(false);
  const statsSilent = ref(false);
  const refreshing = ref(false);
  const stats = ref<any>(null);

  const logQuery = reactive({ uid: '' });
  const logsLoading = ref(false);
  const logData = ref<any[]>([]);
  const logPagination = reactive({ total: 0, current: 1, pageSize: 20 });

  const jobsLoading = ref(false);
  const jobData = ref<any[]>([]);
  const reindexLoading = ref(false);
  const reindexArticleId = ref<number | undefined>();

  let pollTimer: ReturnType<typeof setInterval> | null = null;

  const embeddingModeLabel = computed(() => {
    const mode = stats.value?.embeddingMode;
    if (!mode) return '未知（请重启 blog-server）';
    return mode === 'remote' ? '远程 API' : '本地 hash';
  });

  const embeddingRemoteConfigured = computed(() => stats.value?.embeddingRemoteConfigured === true);

  const showLocalEmbeddingNotConfigured = computed(() => {
    const mode = stats.value?.embeddingMode;
    return (mode === 'local' || !mode) && !embeddingRemoteConfigured.value;
  });

  /** 环境已配远程 Embedding，但进程因 API 失败等原因运行在 local */
  const showLocalEmbeddingDegraded = computed(() => {
    return stats.value?.embeddingMode === 'local' && embeddingRemoteConfigured.value;
  });

  const showLocalEmbeddingWarning = computed(
    () => showLocalEmbeddingNotConfigured.value || showLocalEmbeddingDegraded.value,
  );

  const lastJobFailed = computed(
    () => stats.value?.lastJob?.status === 'failed' && !stats.value?.indexing,
  );

  const JOB_STATUS_MAP: Record<string, { label: string; color: string }> = {
    pending: { label: '等待中', color: 'gray' },
    running: { label: '进行中', color: 'arcoblue' },
    success: { label: '成功', color: 'green' },
    failed: { label: '失败', color: 'red' },
  };

  const QUERY_STATUS_MAP: Record<string, { label: string; color: string }> = {
    success: { label: '成功', color: 'green' },
    failed: { label: '失败', color: 'red' },
    quota_exceeded: { label: '配额超限', color: 'orangered' },
  };

  const jobStatusLabel = (status?: string) => JOB_STATUS_MAP[status || '']?.label || status || '-';
  const jobStatusColor = (status?: string) => JOB_STATUS_MAP[status || '']?.color || 'gray';
  const queryStatusLabel = (status?: string) =>
    QUERY_STATUS_MAP[status || '']?.label || status || '-';
  const queryStatusColor = (status?: string) => QUERY_STATUS_MAP[status || '']?.color || 'gray';

  const lastJobStatusLabel = computed(() => {
    const job = stats.value?.lastJob;
    if (!job) return '-';
    return `${jobStatusLabel(job.status)}${job.chunkCount ? ` / ${job.chunkCount}块` : ''}`;
  });

  /** 统计概览卡片：4×2 网格，数字与文本统一卡片样式 */
  const overviewStatItems = computed(() => {
    const s = stats.value;
    return [
      {
        key: 'todayQueries',
        label: '今日问答',
        value: s?.todayQueries ?? 0,
        type: 'number' as const,
      },
      { key: 'weekQueries', label: '7日问答', value: s?.weekQueries ?? 0, type: 'number' as const },
      {
        key: 'successToday',
        label: '今日成功',
        value: s?.successToday ?? 0,
        type: 'number' as const,
      },
      {
        key: 'quotaExceededToday',
        label: '今日配额拒绝',
        value: s?.quotaExceededToday ?? 0,
        type: 'number' as const,
      },
      { key: 'chunkCount', label: '知识块数', value: s?.chunkCount ?? 0, type: 'number' as const },
      {
        key: 'embeddingMode',
        label: '向量模式',
        value: embeddingModeLabel.value,
        type: 'text' as const,
      },
      { key: 'lastJob', label: '最近索引', value: lastJobStatusLabel.value, type: 'text' as const },
      {
        key: 'embeddingModel',
        label: 'Embedding 模型',
        value: s?.embeddingModel || '-',
        type: 'text' as const,
      },
    ];
  });

  const formatTime = (value?: string) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-');

  /** 趋势表日期：后端 DATE() 可能返回 ISO 字符串，统一格式化为 YYYY-MM-DD */
  const formatDate = (value?: string) => (value ? dayjs(value).format('YYYY-MM-DD') : '-');

  const stopPolling = () => {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  };

  const startPollingIfIndexing = () => {
    if (!stats.value?.indexing) {
      stopPolling();
      return;
    }
    if (pollTimer) return;

    pollTimer = setInterval(async () => {
      await loadStats(true);
      await loadJobs(true);
      if (!stats.value?.indexing) {
        stopPolling();
        const last = stats.value?.lastJob;
        if (last?.status === 'failed') {
          Message.error(`索引失败：${last.errorMsg || '未知错误'}`);
        } else {
          Message.success(
            `索引完成，共 ${last?.chunkCount ?? stats.value?.chunkCount ?? 0} 个知识块`,
          );
        }
      }
    }, 3000);
  };

  const loadStats = async (silent = false) => {
    statsSilent.value = silent;
    if (!silent) statsLoading.value = true;
    try {
      const res = assertApiOk(await getRagStats(), '加载统计失败');
      stats.value = res.data;
      if (stats.value?.indexing) {
        startPollingIfIndexing();
      } else {
        stopPolling();
      }
    } catch (e) {
      if (!silent) Message.error(getApiErrorMessage(e, '加载统计失败'));
    } finally {
      if (!silent) statsLoading.value = false;
      statsSilent.value = false;
    }
  };

  const loadLogs = async (silent = false) => {
    if (!silent) logsLoading.value = true;
    try {
      const res = assertApiOk(
        await getRagQueryLogs({
          page: logPagination.current,
          pageSize: logPagination.pageSize,
          uid: logQuery.uid?.trim() || undefined,
        }),
        '加载查询日志失败',
      );
      logData.value = res.data?.list || [];
      logPagination.total = res.data?.pagination?.total || 0;
    } catch (e) {
      if (!silent) Message.error(getApiErrorMessage(e, '加载查询日志失败'));
    } finally {
      if (!silent) logsLoading.value = false;
    }
  };

  const loadJobs = async (silent = false) => {
    if (!silent) jobsLoading.value = true;
    try {
      const res = assertApiOk(await getRagIndexJobs({ page: 1, pageSize: 20 }), '加载索引任务失败');
      jobData.value = res.data?.list || [];
    } catch (e) {
      if (!silent) Message.error(getApiErrorMessage(e, '加载索引任务失败'));
    } finally {
      if (!silent) jobsLoading.value = false;
    }
  };

  const handleRefreshAll = async () => {
    refreshing.value = true;
    try {
      await Promise.all([loadStats(), loadLogs(), loadJobs()]);
      Message.success('已刷新');
    } finally {
      refreshing.value = false;
    }
  };

  const handleLogSearch = () => {
    logPagination.current = 1;
    loadLogs();
  };

  const handleLogReset = () => {
    logQuery.uid = '';
    logPagination.current = 1;
    loadLogs();
  };

  const onTabChange = (key: string | number) => {
    if (key === 'logs') loadLogs();
    if (key === 'index') loadJobs();
  };

  const handleFullReindex = () => {
    if (stats.value?.indexing) {
      Message.warning('索引任务进行中，请稍后再试');
      return;
    }

    const localHint = showLocalEmbeddingWarning.value
      ? '当前为本地向量模式，重建后检索质量仍有限。建议先配置 Embedding Key 并重启服务。\n\n'
      : '';

    Modal.confirm({
      title: '全量重建索引',
      content: `${localHint}将删除并重新生成全部知识块向量，耗时取决于文章数量，期间请勿重复触发。`,
      okText: '开始重建',
      cancelText: '取消',
      onOk: async () => {
        reindexLoading.value = true;
        try {
          const res = assertApiOk(await triggerRagReindex(), '触发失败');
          Message.success(res.data?.message || res.message || '已提交全量索引任务');
          activeTab.value = 'index';
          await Promise.all([loadJobs(), loadStats()]);
          startPollingIfIndexing();
        } catch (e) {
          Message.error(getApiErrorMessage(e, '触发失败'));
        } finally {
          reindexLoading.value = false;
        }
      },
    });
  };

  const handleArticleReindex = () => {
    if (!reindexArticleId.value) {
      Message.warning('请输入文章 ID');
      return;
    }
    if (stats.value?.indexing) {
      Message.warning('全量索引进行中，请稍后再试');
      return;
    }

    Modal.confirm({
      title: '单篇重建索引',
      content: `将重建文章 ID ${reindexArticleId.value} 的知识块向量。`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        reindexLoading.value = true;
        try {
          const res = assertApiOk(
            await triggerRagReindex({ articleId: reindexArticleId.value }),
            '索引失败',
          );
          Message.success(res.data?.message || '单篇索引完成');
          await Promise.all([loadJobs(), loadStats()]);
        } catch (e) {
          Message.error(getApiErrorMessage(e, '索引失败'));
        } finally {
          reindexLoading.value = false;
        }
      },
    });
  };

  const onLogPageChange = (page: number) => {
    logPagination.current = page;
    loadLogs();
  };

  const onLogPageSizeChange = (size: number) => {
    logPagination.pageSize = size;
    logPagination.current = 1;
    loadLogs();
  };

  onMounted(async () => {
    await loadStats();
    await loadLogs();
    await loadJobs();
  });

  onUnmounted(() => {
    stopPolling();
  });
</script>

<script lang="ts">
  export default {
    name: 'RagIndex',
  };
</script>

<style scoped>
  .container {
    padding: 20px;
  }

  .stats-overview {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 20px;
  }

  .stat-card {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 88px;
    padding: 16px;
    background: var(--color-fill-1);
    border: 1px solid var(--color-border-2);
    border-radius: 4px;
  }

  .stat-card__label {
    margin-bottom: 8px;
    color: var(--color-text-3);
    font-size: 13px;
    line-height: 1.4;
  }

  .stat-card__value {
    color: var(--color-text-1);
    font-size: 28px;
    font-weight: 600;
    line-height: 1.2;
    font-variant-numeric: tabular-nums;
  }

  .stat-card__value--text {
    font-size: 15px;
    font-weight: 500;
    line-height: 1.5;
    word-break: break-all;
  }

  .stats-detail-row {
    margin-top: 4px;
  }

  .stats-panel {
    height: 100%;
    padding: 16px;
    background: var(--color-fill-1);
    border: 1px solid var(--color-border-2);
    border-radius: 4px;
  }

  .stats-panel__title {
    margin: 0 0 12px;
    color: var(--color-text-1);
    font-size: 14px;
    font-weight: 600;
    line-height: 1.4;
  }

  @media screen and (max-width: 1200px) {
    .stats-overview {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media screen and (max-width: 576px) {
    .stats-overview {
      grid-template-columns: 1fr;
    }
  }

  .embedding-alert-title {
    font-weight: 600;
    margin-bottom: 6px;
  }

  .embedding-alert-body {
    margin-top: 4px;
    line-height: 1.6;
  }

  .embedding-alert-body code {
    padding: 0 4px;
    background: rgba(0, 0, 0, 0.06);
    border-radius: 2px;
  }
</style>
