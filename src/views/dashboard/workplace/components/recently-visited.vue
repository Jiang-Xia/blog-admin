<template>
  <a-card
    class="general-card"
    :title="$t('workplace.recently.visited')"
    :header-style="{ paddingBottom: '0' }"
    :body-style="{ paddingTop: '26px' }"
  >
    <div style="margin-bottom: -1rem">
      <a-row :gutter="8">
        <a-col
          v-for="link in links"
          :key="link.text"
          :span="8"
          class="wrapper"
          @click="$router.push(link.url)"
        >
          <div class="icon">
            <component :is="link.icon" />
          </div>
          <a-typography-paragraph class="text">
            {{ link.text }}
          </a-typography-paragraph>
        </a-col>
      </a-row>
    </div>
  </a-card>
</template>

<script lang="ts" setup>
  const links = [
    { text: '文章编辑.', icon: 'icon-storage', url: '/article/edit' },
  ];
</script>

<style lang="less" scoped>
  :deep(.arco-card-header-title) {
    line-height: inherit;
  }
</style>
