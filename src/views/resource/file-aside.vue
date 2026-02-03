<template>
  <div v-if="windowWidth > 715" class="file-aside">
    <div class="heading">{{ t('resource.title') }}</div>
    <a-menu
      :style="{ 'width': '220px', 'height': '100%', 'border-radius': '2px' }"
      :default-open-keys="['0']"
      :default-selected-keys="[currentKey]"
    >
      <a-sub-menu key="0">
        <template #icon>
          <icon-apps></icon-apps>
        </template>
        <template #title>{{ t('resource.fileType.document') }}</template>
        <a-menu-item
          v-for="item in fileTypeList"
          :key="item.value.toString()"
          @click="onClickMenuItem(item)"
        >
          <template #icon>
            <x-icon :icon="item.icon"></x-icon>
          </template>
          <span>{{ t(item.i18nKey) }}</span>
        </a-menu-item>
      </a-sub-menu>
    </a-menu>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useWindowSize } from '@vueuse/core';
  import { fileTypeList, type fileTypeListItem } from './file-map';

  const { t } = useI18n();
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
