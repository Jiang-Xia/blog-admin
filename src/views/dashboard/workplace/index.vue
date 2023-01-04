<template>
  <div class="container">
    <div class="left-side">
      <div class="panel">
        <Banner />
        <DataPanel :count-obj="countObj" />
        <ContentChart v-if="loadedData" :chart-data="chartData" />
      </div>
      <a-grid :cols="24" :col-gap="16" :row-gap="16" style="margin-top: 16px">
        <a-grid-item
          :span="{ xs: 24, sm: 24, md: 24, lg: 12, xl: 12, xxl: 12 }"
        >
          <PopularContent />
        </a-grid-item>
        <a-grid-item
          :span="{ xs: 24, sm: 24, md: 24, lg: 12, xl: 12, xxl: 12 }"
        >
          <CategoriesPercent />
        </a-grid-item>
      </a-grid>
    </div>
    <div class="right-side">
      <a-grid :cols="24" :row-gap="16">
        <a-grid-item :span="24">
          <div class="panel moduler-wrap quick-operation-visited">
            <QuickOperation />
            <RecentlyVisited />
          </div>
        </a-grid-item>
        <a-grid-item class="panel" :span="24">
          <Carousel />
        </a-grid-item>
        <a-grid-item class="panel" :span="24">
          <Announcement class="recently-article" />
        </a-grid-item>
        <a-grid-item class="panel" :span="24">
          <Docs />
        </a-grid-item>
      </a-grid>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import dayjs from 'dayjs';
  import request from '@/api/request';
  import { onMounted, reactive, ref } from 'vue';
  // @ts-ignore
  import guidance from '@/utils/guidance';
  import Banner from './components/banner.vue';
  import DataPanel from './components/data-panel.vue';
  import ContentChart from './components/content-chart.vue';
  import PopularContent from './components/popular-content.vue';
  import CategoriesPercent from './components/categories-percent.vue';
  import RecentlyVisited from './components/recently-visited.vue';
  import QuickOperation from './components/quick-operation.vue';
  import Announcement from './components/announcement.vue';
  import Carousel from './components/carousel.vue';
  import Docs from './components/docs.vue';

  const countObj = reactive({
    allCount: 0,
    yesterdayCount: 0,
    todayCount: 0,
    compareYesterday: 0,
  });
  const chartData = ref({});
  const loadedData = ref(false);
  // 今日和昨日访问
  request
    .get('/resources/baidutongji', {
      params: {
        url: '/rest/2.0/tongji/report/getData',
        site_id: 18269632,
        start_date: dayjs(
          new Date().getTime() - 24 * 60 * 60 * 1000 * 365
        ).format('YYYYMMDD'),
        end_date: dayjs().format('YYYYMMDD'),
        metrics: 'pv_count,visitor_count,ip_count',
        method: 'overview/getTimeTrendRpt',
        // method: 'source/all/a',
      },
    })
    .then((res) => {
      const data = res.data.result.items[1];
      // countObj.allCount =
      const y = Number(data[data.length - 2][0]) || 0;
      const t = Number(data[data.length - 1][0]) || 0;
      const a = data.reduce(
        (total: number, curVal: any, curIdx: any, arr: any) => {
          if (typeof curVal[0] === 'number') {
            total += curVal[0];
          }
          return total;
        },
        0
      );
      countObj.yesterdayCount = y;
      countObj.todayCount = t;
      if (t) {
        countObj.compareYesterday = (t > y ? y / t : -y / t) || 0;
      }
      countObj.allCount = a;
      chartData.value = {
        xAxis: res.data.result.items[0].slice(-14),
        sData: data.slice(-14).map((v: any) => {
          if (typeof v[0] === 'number') {
            return v[0];
          }
          return 0;
        }),
      };
      loadedData.value = true;
      console.log(loadedData.value);
    });
  onMounted(guidance);
</script>

<script lang="ts">
  export default {
    name: 'Dashboard', // If you want the include property of keep-alive to take effect, you must name the component
  };
</script>

<style lang="less" scoped>
  .container {
    display: flex;
    padding: 16px 20px;
    padding-bottom: 0;
    background-color: var(--color-fill-2);
  }

  .left-side {
    flex: 1;
    overflow: auto;
  }

  .right-side {
    width: 280px;
    margin-left: 16px;
  }

  .panel {
    overflow: auto;
    background-color: var(--color-bg-2);
    border-radius: 4px;
  }

  :deep(.panel-border) {
    margin-bottom: 0;
    border-bottom: 1px solid rgb(var(--gray-2));
  }

  .moduler-wrap {
    background-color: var(--color-bg-2);
    border-radius: 4px;

    :deep(.text) {
      color: rgb(var(--gray-8));
      font-size: 12px;
      text-align: center;
    }

    :deep(.wrapper) {
      margin-bottom: 8px;
      text-align: center;
      cursor: pointer;

      &:last-child {
        .text {
          margin-bottom: 0;
        }
      }

      &:hover {
        .icon {
          color: rgb(var(--arcoblue-6));
          background-color: #e8f3ff;
        }

        .text {
          color: rgb(var(--arcoblue-6));
        }
      }
    }

    :deep(.icon) {
      display: inline-block;
      width: 32px;
      height: 32px;
      margin-bottom: 4px;
      color: rgb(var(--dark-gray-1));
      font-size: 16px;
      line-height: 32px;
      text-align: center;
      background-color: rgb(var(--gray-1));
      border-radius: 4px;
    }
  }
</style>

<style lang="less" scoped>
  // responsive
  .mobile {
    .container {
      display: block;
    }

    .right-side {
      // display: none;
      width: 100%;
      margin-top: 16px;
      margin-left: 0;
    }
  }
</style>
