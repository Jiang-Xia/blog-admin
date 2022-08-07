<script setup lang="ts" name="FileManage">
  import FileAside from './file-aside.vue';
  import FileMain from './file-main.vue';
</script>

<template>
  <div class="file-manage">
    <FileAside></FileAside>
    <FileMain></FileMain>
  </div>
</template>

<style lang="less" scoped>
  .file-manage {
    display: flex;
    flex: 1;
    padding: 12px;
    overflow: hidden;
    color: var(--color-text-1);
  }
</style>
