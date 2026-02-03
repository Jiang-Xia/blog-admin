<template>
  <a-card
    class="general-card"
    :title="t('workplace.projectCode')"
    :header-style="{ paddingBottom: 0 }"
    :body-style="{ paddingTop: 0 }"
    style="height: 166px"
  >
    <a-row>
      <a-col :span="12">
        <a-link href="https://gitee.com/jiang-xia/blog-home-nuxt">
          {{ t('workplace.projectCode.blogFrontend') }}
        </a-link>
      </a-col>
      <a-col :span="12">
        <a-link href="https://gitee.com/jiang-xia/blog-admin">
          {{ t('workplace.projectCode.blogAdmin') }}
        </a-link>
      </a-col>
      <a-col :span="18">
        <a-link href="https://gitee.com/jiang-xia/blog-server">
          {{ t('workplace.projectCode.blogServer') }}
        </a-link>
      </a-col>
    </a-row>
  </a-card>
</template>

<script lang="ts" setup>
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();
</script>

<style lang="less" scoped>
  .arco-card-body .arco-link {
    margin: 10px 0;
    color: rgb(var(--gray-8));
  }
</style>
