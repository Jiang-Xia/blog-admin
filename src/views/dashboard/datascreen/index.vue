<template>
  <div class="data-screen-container" :class="{ fullscreen: isFullscreen }">
    <!-- 头部标题栏 -->
    <div class="screen-header">
      <div class="header-left">
        <icon-dashboard class="header-icon" />
        <span class="header-title">{{ t('datascreen.header.title') }}</span>
        <div class="live-indicator">
          <span class="live-dot"></span>
          <span class="live-text">{{ t('datascreen.header.realtime') }}</span>
        </div>
      </div>
      <div class="header-center">
        <span class="current-time">{{ currentTime }}</span>
      </div>
      <div class="header-right">
        <a-button type="text" @click="toggleFullscreen">
          <template #icon>
            <icon-fullscreen v-if="!isFullscreen" />
            <icon-fullscreen-exit v-else />
          </template>
          {{
            isFullscreen ? t('datascreen.header.exitFullscreen') : t('datascreen.header.fullscreen')
          }}
        </a-button>
      </div>
    </div>

    <!-- 数据概览卡片区 -->
    <div class="overview-cards">
      <OverviewCard
        v-for="(item, index) in overviewData"
        :key="index"
        :title="item.title"
        :value="item.value"
        :icon="item.icon"
        :color="item.color"
        :trend="item.trend"
      />
    </div>

    <!-- 图表展示区 -->
    <div class="charts-container">
      <!-- 左侧图表 -->
      <div class="charts-left">
        <ViewTrendChart :loading="loading" :chart-data="chartData" />
        <ArticlePublishChart :loading="loading" :chart-data="chartData" />
      </div>

      <!-- 中间图表 -->
      <div class="charts-center">
        <CategoryChart :loading="loading" :chart-data="chartData" />
        <TagCloudChart :loading="loading" :chart-data="chartData" />
      </div>

      <!-- 右侧图表 -->
      <div class="charts-right">
        <PopularArticles :loading="loading" :chart-data="chartData" />
        <RecentActivities :loading="loading" :chart-data="chartData" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import { getBlogOverview } from '@/api/datascreen';
  import OverviewCard from './components/overview-card.vue';
  import ViewTrendChart from './components/view-trend-chart.vue';
  import ArticlePublishChart from './components/article-publish-chart.vue';
  import CategoryChart from './components/category-chart.vue';
  import TagCloudChart from './components/tag-cloud-chart.vue';
  import PopularArticles from './components/popular-articles.vue';
  import RecentActivities from './components/recent-activities.vue';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  const isFullscreen = ref(false);
  const currentTime = ref('');
  const loading = ref(false);
  const chartData = ref<any>(null); // 存储所有图表数据

  const overviewData = ref([
    {
      title: t('datascreen.metric.articleTotal'),
      value: 0,
      icon: 'icon-file',
      color: '#165DFF',
      trend: 0,
    },
    {
      title: t('datascreen.metric.totalViewsSum'),
      value: 0,
      icon: 'icon-eye',
      color: '#14C9C9',
      trend: 0,
    },
    {
      title: t('datascreen.metric.totalLikesSum'),
      value: 0,
      icon: 'icon-thumb-up',
      color: '#F7BA1E',
      trend: 0,
    },
    {
      title: t('datascreen.metric.commentTotal'),
      value: 0,
      icon: 'icon-message',
      color: '#F77234',
      trend: 0,
    },
  ]);

  // 更新时间
  const updateTime = () => {
    const now = new Date();
    currentTime.value = now.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  // 切换全屏
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      isFullscreen.value = true;
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        isFullscreen.value = false;
      }
    }
  };

  // 加载统计数据
  const loadOverviewData = async () => {
    loading.value = true;
    try {
      const res = await getBlogOverview();
      if (res.data) {
        // 保存完整数据供子组件使用
        chartData.value = res.data;

        const { total, totalViews, totalLikes, totalComments, trends } = res.data;

        // 设置概览数据
        const values = [total || 0, totalViews || 0, totalLikes || 0, totalComments || 0];
        const trendKeys: Array<'article' | 'views' | 'likes' | 'comments'> = [
          'article',
          'views',
          'likes',
          'comments',
        ];

        overviewData.value.forEach((item, index) => {
          item.value = values[index] || 0;
          const trendKey = trendKeys[index];
          item.trend = trendKey && trends ? trends[trendKey] || 0 : 0;
        });
      }
    } catch (error) {
      console.error('加载统计数据失败:', error);
    } finally {
      loading.value = false;
    }
  };

  let timer: any = null;
  let refreshTimer: any = null;

  onMounted(() => {
    updateTime();
    timer = setInterval(updateTime, 1000);

    // 首次加载数据
    loadOverviewData();

    // 每30秒自动刷新一次数据
    refreshTimer = setInterval(() => {
      loadOverviewData();
    }, 30000);

    // 监听全屏变化
    document.addEventListener('fullscreenchange', () => {
      isFullscreen.value = !!document.fullscreenElement;
    });
  });

  onUnmounted(() => {
    if (timer) {
      clearInterval(timer);
    }
    if (refreshTimer) {
      clearInterval(refreshTimer);
    }
  });
</script>

<style lang="less" scoped>
  .data-screen-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
    padding: 20px;
    color: #fff;
    overflow-x: hidden;

    &.fullscreen {
      padding: 10px;
    }
  }

  .screen-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    background: linear-gradient(90deg, rgba(22, 93, 255, 0.1) 0%, rgba(20, 201, 201, 0.1) 100%);
    border-radius: 8px;
    margin-bottom: 20px;
    border: 1px solid rgba(22, 93, 255, 0.3);

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;

      .header-icon {
        font-size: 32px;
        color: #165dff;
      }

      .header-title {
        font-size: 28px;
        font-weight: bold;
        background: linear-gradient(90deg, #165dff 0%, #14c9c9 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .live-indicator {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 12px;
        background: rgba(245, 63, 63, 0.1);
        border-radius: 12px;
        border: 1px solid rgba(245, 63, 63, 0.3);

        .live-dot {
          width: 8px;
          height: 8px;
          background: #f53f3f;
          border-radius: 50%;
          animation: livePulse 2s ease-in-out infinite;
        }

        .live-text {
          font-size: 12px;
          color: #f53f3f;
          font-weight: 500;
        }
      }
    }

    .header-center {
      .current-time {
        font-size: 20px;
        color: #86909c;
        letter-spacing: 2px;
      }
    }

    .header-right {
      :deep(.arco-btn-text) {
        color: #86909c;
        font-size: 16px;

        &:hover {
          color: #165dff;
        }
      }
    }
  }

  .overview-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
  }

  .charts-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;

    .charts-left,
    .charts-center,
    .charts-right {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
  }

  // 响应式布局
  @media screen and (max-width: 1600px) {
    .charts-container {
      grid-template-columns: repeat(2, 1fr);

      .charts-right {
        grid-column: 1 / -1;
        flex-direction: row;
      }
    }
  }

  @media screen and (max-width: 1200px) {
    .charts-container {
      grid-template-columns: 1fr;

      .charts-right {
        flex-direction: column;
      }
    }

    .overview-cards {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media screen and (max-width: 768px) {
    .overview-cards {
      grid-template-columns: 1fr;
    }

    .screen-header {
      flex-direction: column;
      gap: 10px;

      .header-left,
      .header-center,
      .header-right {
        width: 100%;
        justify-content: center;
      }
    }
  }

  // 实时指示器脉冲动画
  @keyframes livePulse {
    0%,
    100% {
      opacity: 1;
      box-shadow: 0 0 0 0 rgba(245, 63, 63, 0.7);
    }
    50% {
      opacity: 0.6;
      box-shadow: 0 0 0 6px rgba(245, 63, 63, 0);
    }
  }
</style>
