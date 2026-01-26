<template>
  <div
    class="overview-card"
    :style="{ borderColor: color }"
    :class="{ 'data-updated': isUpdating }"
  >
    <div class="card-header">
      <div class="card-icon" :style="{ backgroundColor: color + '20' }">
        <component :is="icon" :style="{ color: color }" />
      </div>
      <span class="card-title">{{ title }}</span>
    </div>
    <div class="card-body">
      <div class="card-value">
        <a-statistic :value="value" :value-from="0" animation :duration="2000">
          <template #prefix>
            <span class="value-text"></span>
          </template>
        </a-statistic>
      </div>
      <div v-if="trend !== undefined" class="card-trend" :class="trend >= 0 ? 'up' : 'down'">
        <icon-arrow-rise v-if="trend >= 0" />
        <icon-arrow-fall v-else />
        <span>{{ Math.abs(trend) }}%</span>
      </div>
    </div>
    <div class="card-footer">
      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{ width: progressWidth + '%', backgroundColor: color }"
        ></div>
      </div>
    </div>
    <!-- 数据更新闪烁效果 -->
    <div class="update-flash"></div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, watch, computed } from 'vue';

  const props = defineProps({
    title: {
      type: String,
      required: true,
    },
    value: {
      type: Number,
      default: 0,
    },
    icon: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      default: '#165DFF',
    },
    trend: {
      type: Number,
      default: undefined,
    },
  });

  const isUpdating = ref(false);
  const progressWidth = ref(0);

  // 监听数值变化，触发更新动画
  watch(
    () => props.value,
    (newVal, oldVal) => {
      if (oldVal !== undefined && newVal !== oldVal) {
        isUpdating.value = true;
        setTimeout(() => {
          isUpdating.value = false;
        }, 1000);
      }
      // 模拟进度条动画
      progressWidth.value = 0;
      setTimeout(() => {
        progressWidth.value = Math.min(75 + Math.random() * 20, 95);
      }, 100);
    },
    { immediate: true },
  );
</script>

<style lang="less" scoped>
  .overview-card {
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.05) 0%,
      rgba(255, 255, 255, 0.02) 100%
    );
    border-radius: 12px;
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, transparent, currentColor, transparent);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &:hover {
      transform: translateY(-5px);
      border-color: currentColor !important;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);

      &::before {
        opacity: 1;
      }
    }

    // 数据更新时的动画效果
    &.data-updated {
      animation: cardPulse 0.6s ease-out;

      .update-flash {
        animation: flashEffect 0.6s ease-out;
      }
    }

    .update-flash {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at center, rgba(255, 255, 255, 0.2), transparent);
      pointer-events: none;
      opacity: 0;
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;

      .card-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        animation: iconFloat 3s ease-in-out infinite;
      }

      .card-title {
        font-size: 14px;
        color: #86909c;
        font-weight: 500;
      }
    }

    .card-body {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 16px;

      .card-value {
        :deep(.arco-statistic) {
          .arco-statistic-value {
            font-size: 32px;
            font-weight: bold;
            color: #fff;
          }
        }
      }

      .card-trend {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 14px;
        padding: 4px 8px;
        border-radius: 4px;
        animation: trendBounce 0.5s ease-out;

        &.up {
          color: #00b42a;
          background: rgba(0, 180, 42, 0.1);
        }

        &.down {
          color: #f53f3f;
          background: rgba(245, 63, 63, 0.1);
        }
      }
    }

    .card-footer {
      .progress-bar {
        height: 4px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
        overflow: hidden;

        .progress-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 0 10px currentColor;
        }
      }
    }
  }

  // 卡片脉冲动画
  @keyframes cardPulse {
    0% {
      box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
    }
    50% {
      box-shadow: 0 0 20px 10px rgba(255, 255, 255, 0.1);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
    }
  }

  // 闪烁效果
  @keyframes flashEffect {
    0% {
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  // 图标浮动动画
  @keyframes iconFloat {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-5px);
    }
  }

  // 趋势弹跳动画
  @keyframes trendBounce {
    0% {
      transform: scale(0.8);
      opacity: 0;
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
</style>
