<template>
  <div class="chart-card">
    <div class="chart-header">
      <icon-apps class="header-icon" />
      <span class="chart-title">分类文章统计</span>
    </div>
    <a-spin :loading="loading" style="width: 100%">
      <Chart height="300px" :option="chartOption" />
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, watch } from 'vue';
  import useChartOption from '@/hooks/chart-option';

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

  const categoryData = ref<Array<{ name: string; value: number }>>([]);

  // 监听 chartData 变化
  watch(
    () => props.chartData,
    (newData) => {
      if (newData && newData.categories) {
        categoryData.value = newData.categories.slice(0, 8).map((item: any) => ({
          name: item.label || item.value,
          value: item.articleCount || 0,
        }));
      }
    },
    { immediate: true },
  );

  const { chartOption } = useChartOption(() => {
    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#F7BA1E',
        textStyle: {
          color: '#fff',
        },
        formatter: '{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        right: '10%',
        top: 'center',
        textStyle: {
          color: '#86909C',
          fontSize: 12,
        },
        itemGap: 15,
      },
      series: [
        {
          name: '分类统计',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#0a0e27',
            borderWidth: 2,
          },
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold',
              color: '#fff',
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
          labelLine: {
            show: false,
          },
          data: categoryData.value,
          color: [
            '#165DFF',
            '#14C9C9',
            '#F7BA1E',
            '#F77234',
            '#00B42A',
            '#722ED1',
            '#F53F3F',
            '#86909C',
          ],
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
        color: #f7ba1e;
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
