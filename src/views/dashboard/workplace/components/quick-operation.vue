<template>
  <a-card
    class="general-card"
    :title="t('workplace.quick.operation')"
    :header-style="{ paddingBottom: '0' }"
    :body-style="{ padding: '24px 20px 0 20px' }"
  >
    <template #extra>
      <a-link>{{ t('workplace.quickOperation.setup') }}</a-link>
    </template>
    <a-row :gutter="8">
      <a-col
        v-for="link in links"
        :key="link.text"
        :span="8"
        class="wrapper"
        @click="router.push(link.url)"
      >
        <div class="icon">
          <component :is="link.icon" />
        </div>
        <a-typography-paragraph class="text">
          {{ t(link.i18n) }}
        </a-typography-paragraph>
      </a-col>
    </a-row>
    <a-divider class="split-line" style="margin: 0" />
  </a-card>
</template>

<script lang="ts" setup>
  import { useI18n } from 'vue-i18n';
  import { useRouter } from 'vue-router';

  const router = useRouter();
  const { t } = useI18n();
  const links = [
    { i18n: 'workplace.fileManagement', icon: 'icon-file', url: '/resource/list' },
    { i18n: 'workplace.articleList', icon: 'icon-storage', url: '/article/list' },
    { i18n: 'workplace.menuSettings', icon: 'icon-settings', url: '/system/userManage' },
    { i18n: 'workplace.userManagement', icon: 'icon-user', url: '/system/menuManage' },
  ];
</script>

<style scoped lang="less"></style>
