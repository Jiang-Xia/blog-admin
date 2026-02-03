<template>
  <a-spin :loading="loading" style="width: 100%">
    <a-card
      class="general-card"
      :header-style="{ paddingBottom: '0' }"
      :body-style="{
        padding: '20px',
      }"
    >
      <template #title> {{ t('workplace.categoriesPercent') }} </template>
      <Chart height="310px" :option="chartOption" />
    </a-card>
  </a-spin>
</template>

<script lang="ts" setup>
  import { useI18n } from 'vue-i18n';
  const { t } = useI18n();
  import useLoading from '@/hooks/loading';
  import useChartOption from '@/hooks/chart-option';
  import { ref, computed } from 'vue';
  import type { ListState } from '@/types/global';
  import { getAllCategory } from '@/api/category';

  const categoryOptions = ref<ListState[]>();
  const { loading, setLoading } = useLoading();
  const fetchData = async () => {
    try {
      setLoading(true);
      const options = await getAllCategory({ isDelete: true });
      categoryOptions.value = options.slice(0, 5);
    } catch (err) {
      // you can report use errorHandler or other
    } finally {
      setLoading(false);
    }
  };
  fetchData();
  const categoryData = computed(() => categoryOptions.value?.map((v) => v.value));
  const seriesData: any = computed(() =>
    categoryOptions.value?.map((v: any) => {
      return {
        value: [v.articleCount],
        name: v.value,
      };
    }),
  );
  const count: any = computed(() =>
    categoryOptions.value?.reduce((sum: number, cur: any) => {
      sum += cur.articleCount;
      return sum;
    }, 0),
  );
  const { chartOption } = useChartOption((isDark) => {
    // echarts support https://echarts.apache.org/zh/theme-builder.html
    // It's not used here
    return {
      legend: {
        left: 'center',
        data: categoryData.value,
        bottom: 0,
        icon: 'circle',
        itemWidth: 8,
        textStyle: {
          color: isDark ? 'rgba(255, 255, 255, 0.7)' : '#4E5969',
        },
        itemStyle: {
          borderWidth: 0,
        },
      },
      tooltip: {
        show: true,
        trigger: 'item',
      },
      graphic: {
        elements: [
          {
            type: 'text',
            left: 'center',
            top: '40%',
            style: {
              text: t('workplace.articleCount'),
              textAlign: 'center',
              fill: isDark ? '#ffffffb3' : '#4E5969',
              fontSize: 14,
            },
          },
          {
            type: 'text',
            left: 'center',
            top: '50%',
            style: {
              text: count.value,
              textAlign: 'center',
              fill: isDark ? '#ffffffb3' : '#1D2129',
              fontSize: 16,
              fontWeight: 500,
            },
          },
        ],
      },
      series: [
        {
          type: 'pie',
          radius: ['50%', '70%'],
          center: ['50%', '50%'],
          label: {
            formatter: '{d}%',
            fontSize: 14,
            color: isDark ? 'rgba(255, 255, 255, 0.7)' : '#4E5969',
          },
          itemStyle: {
            borderColor: isDark ? '#232324' : '#fff',
            borderWidth: 1,
          },
          data: seriesData.value,
        },
      ],
    };
  });
</script>

<style scoped lang="less"></style>
