<template>
  <VCharts
    v-if="renderChart"
    :option="option"
    :auto-resize="autoResize"
    :style="{ width, height }"
  />
</template>

<script lang="ts" setup>
  /**
   * ECharts 包装：模块注册放在本文件，随 Chart 按需加载，不进全局入口。
   */
  import { ref, nextTick } from 'vue';
  import { use } from 'echarts/core';
  import { CanvasRenderer } from 'echarts/renderers';
  import { BarChart, LineChart, PieChart, RadarChart } from 'echarts/charts';
  import {
    GridComponent,
    TooltipComponent,
    LegendComponent,
    DataZoomComponent,
    GraphicComponent,
  } from 'echarts/components';
  import VCharts from 'vue-echarts';

  // 按需注册图表能力（与原先 components/index 一致）
  use([
    CanvasRenderer,
    BarChart,
    LineChart,
    PieChart,
    RadarChart,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    DataZoomComponent,
    GraphicComponent,
  ]);

  defineProps({
    // 与各业务页 `:option` 对齐（原 props 名 options 与调用不一致）
    option: {
      type: Object,
      default() {
        return {};
      },
    },
    autoResize: {
      type: Boolean,
      default: true,
    },
    width: {
      type: String,
      default: '100%',
    },
    height: {
      type: String,
      default: '100%',
    },
  });

  const renderChart = ref(false);
  // wait container expand
  nextTick(() => {
    renderChart.value = true;
  });
</script>

<style scoped lang="less"></style>
