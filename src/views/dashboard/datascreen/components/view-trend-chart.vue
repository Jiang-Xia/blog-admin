<template>
  <div class="chart-card">
    <div class="chart-header">
      <icon-bar-chart class="header-icon" />
      <span class="chart-title">访问量趋势</span>
      <a-tag color="arcoblue" size="small" style="margin-left: 8px">近30天</a-tag>
    </div>
    <a-spin :loading="loading" style="width: 100%">
      <Chart height="300px" :option="chartOption" />
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed, onMounted, watch } from 'vue';
  import useChartOption from '@/hooks/chart-option';
  import { graphic } from 'echarts';

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

  const viewData = ref<{
    dates: string[];
    values: number[];
  }>({
    dates: [],
    values: [],
  });

  // 监听 chartData 变化
  watch(
    () => props.chartData,
    (newData) => {
      if (newData && newData.viewTrend) {
        viewData.value = {
          dates: newData.viewTrend.map((item: any) => item.date),
          values: newData.viewTrend.map((item: any) => item.views),
        };
      }
    },
    { immediate: true },
  );

  const { chartOption } = useChartOption(() => {
    return {
      animation: true,
      animationDuration: 2000,
      animationEasing: 'cubicOut',
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: viewData.value.dates,
        boundaryGap: false,
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.2)',
          },
        },
        axisLabel: {
          color: '#86909C',
          fontSize: 12,
        },
        splitLine: {
          show: false,
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
        borderColor: '#165DFF',
        textStyle: {
          color: '#fff',
        },
      },
      series: [
        {
          name: '访问量',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          data: viewData.value.values,
          lineStyle: {
            width: 3,
            color: new graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#165DFF' },
              { offset: 1, color: '#14C9C9' },
            ]),
          },
          itemStyle: {
            color: '#165DFF',
            borderColor: '#fff',
            borderWidth: 2,
          },
          areaStyle: {
            color: new graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(22, 93, 255, 0.3)' },
              { offset: 1, color: 'rgba(22, 93, 255, 0.05)' },
            ]),
          },
          animationDelay: (idx: number) => idx * 50,
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
        color: #165dff;
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
