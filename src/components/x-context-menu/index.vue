<template>
  <transition name="slide-dynamic-origin">
    <div v-show="visible" ref="elRef" class="gi-context-menu" :style="getStyle()">
      <slot></slot>
    </div>
  </transition>
</template>

<script setup lang="ts" name="GiContextMenu">
  import { ref, watch } from 'vue';
  import { onClickOutside, useWindowSize } from '@vueuse/core';
  import { useContextMenu } from '@/hooks/common';

  const props = defineProps<{
    event: PointerEvent;
    options: { alignPoint?: boolean };
    ignoreRefs: Element[];
  }>();

  const elRef = ref<HTMLElement | null>(null);

  const { visible, setVisible, getStyle } = useContextMenu(props.event, elRef, props.options);

  // 检测在一个元素之外的任何点击
  const emit = defineEmits(['close']);
  onClickOutside(
    elRef,
    () => {
      setVisible(false);
      emit('close');
    },
    // { capture: false, ignore: props.ignoreRefs }
  );

  // 窗口尺寸变化关闭
  const { width: windowWidth, height: windowHeight } = useWindowSize();
  watch(
    () => [windowWidth.value, windowHeight.value],
    () => {
      setVisible(false);
      emit('close');
    },
  );

  const onHidden = () => {
    setVisible(false);
    emit('close');
  };

  defineExpose({
    visible,
    onHidden,
  });
</script>

<style lang="scss" scoped>
  .gi-context-menu {
    position: fixed;
    box-sizing: border-box;
    overflow: hidden;
    background: var(--color-bg-popup);
    border: 1px solid var(--color-border-2);
    border-radius: 4px;
    box-shadow:
      0 2px 4px rgba(0, 0, 0, 0.12),
      0 0 6px rgba(0, 0, 0, 0.04);
  }
</style>
