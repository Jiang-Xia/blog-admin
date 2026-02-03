<template>
  <div class="chart-card">
    <div class="chart-header">
      <icon-history class="header-icon" />
      <span class="chart-title">{{ t('datascreen.chart.recentActivities') }}</span>
    </div>
    <a-spin :loading="loading" style="width: 100%">
      <div class="activity-list">
        <a-timeline mode="left" labelPosition="relative">
          <a-timeline-item v-for="(item, index) in activityList" :key="index" :label="item.time">
            <template #dot>
              <div class="activity-dot" :style="{ backgroundColor: item.color }">
                <icon-file v-if="item.icon === 'icon-file'" />
                <icon-message v-else-if="item.icon === 'icon-message'" />
                <icon-edit v-else-if="item.icon === 'icon-edit'" />
                <icon-apps v-else-if="item.icon === 'icon-apps'" />
                <icon-tags v-else-if="item.icon === 'icon-tags'" />
                <icon-settings v-else-if="item.icon === 'icon-settings'" />
              </div>
            </template>
            <div class="activity-content">
              <div class="activity-type" :style="{ color: item.color }">{{ item.type }}</div>
              <div class="activity-desc">{{ item.desc }}</div>
            </div>
          </a-timeline-item>
        </a-timeline>
      </div>
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, watch } from 'vue';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  const props = defineProps({
    loading: {
      type: Boolean,
      default: false,
    },
    chartData: {
      type: Object,
      default: null,
    },
  });

  const activityList = ref<
    Array<{
      type: string;
      desc: string;
      time: string;
      icon: string;
      color: string;
    }>
  >([]);

  // 计算时间差
  const getTimeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 30) {
      const months = Math.floor(days / 30);
      return `${months}${t('datascreen.time.monthsAgo')}`;
    }
    if (days > 7) {
      const weeks = Math.floor(days / 7);
      return `${weeks}${t('datascreen.time.weeksAgo')}`;
    }
    if (days > 0) return `${days}${t('datascreen.time.daysAgo')}`;
    if (hours > 0) return `${hours}${t('datascreen.time.hoursAgo')}`;
    if (minutes > 0) return `${minutes}${t('datascreen.time.minutesAgo')}`;
    return t('datascreen.time.justNow');
  };

  // 监听 chartData 变化
  watch(
    () => props.chartData,
    (newData) => {
      if (newData && newData.archives && Array.isArray(newData.archives)) {
        // 提取所有文章并按时间排序
        const allArticles: Array<{ title: string; createTime: string; uTime: string }> = [];
        newData.archives.forEach((yearData: any) => {
          if (yearData.data) {
            Object.values(yearData.data).forEach((monthArticles: any) => {
              if (Array.isArray(monthArticles)) {
                allArticles.push(...monthArticles);
              }
            });
          }
        });

        // 按更新时间或创建时间排序，取最近的6条
        allArticles.sort((a, b) => {
          const timeA = new Date(a.uTime || a.createTime).getTime();
          const timeB = new Date(b.uTime || b.createTime).getTime();
          return timeB - timeA;
        });

        // 转换为活动列表
        activityList.value = allArticles.slice(0, 6).map((article, index) => {
          const isUpdated = article.uTime && article.uTime !== article.createTime;
          const time = isUpdated ? article.uTime : article.createTime;
          const colors = ['#165DFF', '#14C9C9', '#F7BA1E', '#F77234', '#00B42A', '#722ED1'];

          return {
            type: isUpdated
              ? t('datascreen.activity.articleEdit')
              : t('datascreen.activity.articlePublish'),
            desc: `${isUpdated ? t('datascreen.activity.edited') : t('datascreen.activity.published')}文章《${article.title}》`,
            time: getTimeAgo(time),
            icon: isUpdated ? 'icon-edit' : 'icon-file',
            color: colors[index % colors.length],
          };
        });
      }
    },
    { immediate: true },
  );
</script>

<style lang="less" scoped>
  .chart-card {
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.05) 0%,
      rgba(255, 255, 255, 0.02) 100%
    );
    border-radius: 12px;
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    display: flex;
    flex-direction: column;

    .chart-header {
      display: flex;
      align-items: center;
      margin-bottom: 20px;

      .header-icon {
        font-size: 20px;
        color: #722ed1;
        margin-right: 8px;
      }

      .chart-title {
        font-size: 16px;
        font-weight: 600;
        color: #fff;
      }
    }

    .activity-list {
      overflow-x: hidden;
      padding-right: 10px;

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 3px;
      }

      :deep(.arco-timeline) {
        padding-right: 8px;

        .arco-timeline-item {
          padding-bottom: 16px;
          margin-left: 60px;

          .arco-timeline-item-label {
            color: #86909c;
            font-size: 11px;
            width: 60px;
            min-width: 60px;
            text-align: left;
            padding-right: 8px;
          }

          .arco-timeline-item-dot-line {
            border-left: 1px solid rgba(255, 255, 255, 0.1);
          }

          .arco-timeline-item-content {
            padding-left: 16px;
            max-width: 100%;
            word-wrap: break-word;
            word-break: break-word;
          }
          .arco-timeline-item-dot-custom {
            background: transparent;
          }
        }
      }

      .activity-dot {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 10px;
      }

      .activity-content {
        max-width: 100%;
        overflow: hidden;

        .activity-type {
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .activity-desc {
          font-size: 12px;
          color: #86909c;
          line-height: 1.5;
          word-wrap: break-word;
          word-break: break-all;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }
</style>
