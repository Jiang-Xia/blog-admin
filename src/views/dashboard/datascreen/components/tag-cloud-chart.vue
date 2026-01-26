<template>
  <div class="chart-card">
    <div class="chart-header">
      <icon-tags class="header-icon" />
      <span class="chart-title">标签词云</span>
    </div>
    <a-spin :loading="loading" style="width: 100%">
      <Chart height="300px" :option="chartOption" />
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, watch } from 'vue';
  import useChartOption from '@/hooks/chart-option';
  import 'echarts-wordcloud';

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

  const tagData = ref<Array<{ name: string; value: number }>>([]);

  // 监听 chartData 变化
  watch(
    () => props.chartData,
    (newData) => {
      if (newData && newData.tags) {
        tagData.value = newData.tags.map((item: any) => ({
          name: item.label || item.value,
          value: (item.articleCount || 0) * 10 + 20,
        }));
      }
    },
    { immediate: true },
  );

  const { chartOption } = useChartOption(() => {
    return {
      tooltip: {
        show: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#F77234',
        textStyle: {
          color: '#fff',
        },
        formatter: (params: any) => {
          return `${params.name}: ${Math.floor(params.value / 10)} 篇`;
        },
      },
      series: [
        {
          type: 'wordCloud',
          sizeRange: [14, 40],
          rotationRange: [-45, 45],
          rotationStep: 45,
          gridSize: 12,
          shape: 'circle',
          width: '100%',
          height: '100%',
          drawOutOfBound: false,
          layoutAnimation: true,
          textStyle: {
            fontFamily: 'sans-serif',
            fontWeight: 'bold',
            color: () => {
              const colors = [
                '#165DFF',
                '#14C9C9',
                '#F7BA1E',
                '#F77234',
                '#00B42A',
                '#722ED1',
                '#F53F3F',
              ];
              return colors[Math.floor(Math.random() * colors.length)];
            },
          },
          emphasis: {
            focus: 'self',
            textStyle: {
              textShadowBlur: 10,
              textShadowColor: '#fff',
            },
          },
          data: tagData.value,
        },
      ],
    };
  });
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

    .chart-header {
      display: flex;
      align-items: center;
      margin-bottom: 20px;

      .header-icon {
        font-size: 20px;
        color: #f77234;
        margin-right: 8px;
      }

      .chart-title {
        font-size: 16px;
        font-weight: 600;
        color: #fff;
      }
    }
  }
</style>
