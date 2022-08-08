<template>
  <div v-if="windowWidth > 715" class="file-aside">
    <div class="heading">文件管理</div>
    <a-menu
      :style="{ 'width': '220px', 'height': '100%', 'border-radius': '2px' }"
      :default-open-keys="['0']"
      :default-selected-keys="[currentKey]"
    >
      <a-sub-menu key="0">
        <template #icon>
          <icon-apps></icon-apps>
        </template>
        <template #title>文件类型</template>
        <a-menu-item
          v-for="item in fileTypeList"
          :key="item.value.toString()"
          @click="onClickMenuItem(item)"
        >
          <template #icon>
            <x-icon :icon="item.icon"></x-icon>
          </template>
          <span>{{ item.name }}</span>
        </a-menu-item>
      </a-sub-menu>
    </a-menu>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useWindowSize } from '@vueuse/core';
  import { fileTypeList, type fileTypeListItem } from './file-map';

  const emits = defineEmits(['menuSelect']);

  const { width: windowWidth } = useWindowSize();

  const currentKey = ref('0');

  // 点击事件
  const onClickMenuItem = (item: fileTypeListItem) => {
    emits('menuSelect', item);
  };
</script>

<style lang="less" scoped>
  .file-aside {
    height: fit-content;
    margin-right: 12px;
    background: var(--color-bg-1);
    border-radius: 8px;

    .heading {
      box-sizing: border-box;
      height: 44px;
      padding: 0 14px;
      line-height: 44px;
      text-align: left;
      border-bottom: 1px solid var(--color-neutral-3);
    }
  }
</style>
