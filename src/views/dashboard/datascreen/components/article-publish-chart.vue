<template>
  <div class="chart-card">
    <div class="chart-header">
      <icon-bar-chart class="header-icon" />
      <span class="chart-title">文章发布趋势</span>
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

  const publishData = ref({
    months: [] as string[],
    values: [] as number[],
  });

  // 监听 chartData 变化
  watch(
    () => props.chartData,
    (newData) => {
      if (newData && newData.publishTrend) {
        publishData.value = {
          months: newData.publishTrend.map((item: any) => item.month),
          values: newData.publishTrend.map((item: any) => item.count),
        };
      }
    },
    { immediate: true },
  );

  const { chartOption } = useChartOption(() => {
    return {
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: publishData.value.months,
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.2)',
          },
        },
        axisLabel: {
          color: '#86909C',
          fontSize: 12,
        },
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: false,
        },
        axisLabel: {
          color: '#86909C',
          fontSize: 12,
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.1)',
            type: 'dashed',
          },
        },
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#14C9C9',
        textStyle: {
          color: '#fff',
        },
      },
      series: [
        {
          name: '发布数量',
          type: 'bar',
          data: publishData.value.values,
          barWidth: '50%',
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#14C9C9' },
                { offset: 1, color: 'rgba(20, 201, 201, 0.3)' },
              ],
            },
            borderRadius: [8, 8, 0, 0],
          },
          emphasis: {
            itemStyle: {
              color: '#14C9C9',
            },
          },
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
        color: #14c9c9;
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
