<template>
  <div class="chart-card">
    <div class="chart-header">
      <icon-fire class="header-icon" />
      <span class="chart-title">热门文章排行</span>
    </div>
    <a-spin :loading="loading" style="width: 100%">
      <div class="popular-list">
        <div v-for="(item, index) in popularList" :key="index" class="popular-item">
          <div class="item-rank" :class="`rank-${index + 1}`">
            {{ index + 1 }}
          </div>
          <div class="item-content">
            <div class="item-title">{{ item.title }}</div>
            <div class="item-stats">
              <span class="stat-item">
                <icon-eye />
                {{ item.views }}
              </span>
              <span class="stat-item">
                <icon-thumb-up />
                {{ item.likes }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, watch } from 'vue';

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

  const popularList = ref<
    Array<{
      title: string;
      views: number;
      likes: number;
    }>
  >([]);

  // 监听 chartData 变化
  watch(
    () => props.chartData,
    (newData) => {
      if (newData && newData.articles && newData.articles.length > 0) {
        // 后端已按访问量排序，直接取前6条
        const topArticles = newData.articles.slice(0, 6);

        popularList.value = topArticles.map((item: any) => ({
          title: item.title,
          views: item.views || 0,
          likes: item.likes || 0,
        }));
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
        color: #f53f3f;
        margin-right: 8px;
      }

      .chart-title {
        font-size: 16px;
        font-weight: 600;
        color: #fff;
      }
    }

    .popular-list {
      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 3px;
      }

      .popular-item {
        display: flex;
        align-items: center;
        padding: 12px;
        margin-bottom: 12px;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 8px;
        transition: all 0.3s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateX(5px);
        }

        .item-rank {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: bold;
          border-radius: 8px;
          margin-right: 12px;
          background: rgba(255, 255, 255, 0.1);
          color: #86909c;

          &.rank-1 {
            background: linear-gradient(135deg, #ffd700, #ffed4e);
            color: #c17900;
          }

          &.rank-2 {
            background: linear-gradient(135deg, #c0c0c0, #e8e8e8);
            color: #757575;
          }

          &.rank-3 {
            background: linear-gradient(135deg, #cd7f32, #e6a35d);
            color: #8b4513;
          }
        }

        .item-content {
          flex: 1;
          min-width: 0;

          .item-title {
            font-size: 14px;
            color: #fff;
            margin-bottom: 8px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .item-stats {
            display: flex;
            gap: 16px;

            .stat-item {
              display: flex;
              align-items: center;
              gap: 4px;
              font-size: 12px;
              color: #86909c;

              svg {
                font-size: 14px;
              }
            }
          }
        }
      }
    }
  }
</style>
