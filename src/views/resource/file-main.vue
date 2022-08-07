<script setup lang="ts">
  import { reactive, ref } from 'vue';
  import { baseUrl } from '@/config';
  import { useUserStore } from '@/store';
  import axios from 'axios';

  const fileList = ref([]);
  const { token } = useUserStore();
  const headers = ref({
    Authorization: `Bearer ${token}`,
  });
  const successHandle = () => {};
  const imageList = ref([]);
  const totalCount = ref(0);
  axios.get('/resources/file').then((res: any) => {
    const [list, total] = res.data;
    imageList.value = list;
    totalCount.value = total;
  });
  const delHandle = (id: string) => {
    axios.get('/resources/delete', { params: { id } });
  };
</script>

<template>
  <div class="file-main">
    <div class="header-tool"></div>
    <section class="file-content">
      <a-upload
        :action="baseUrl + '/resources/uploadFile'"
        list-type="picture-card"
        multiple
        :limit="10"
        :headers="headers"
        :show-file-list="false"
        :default-file-list="fileList"
        image-preview
        @success="successHandle"
      />
      <!-- <div class="image-container"> </div> -->
    </section>
  </div>
</template>

<style lang="less" scoped>
  .file-main {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 50vh;
    padding: 0 12px 12px 12px;
    overflow: hidden;
    background: var(--color-bg-1);
    border-radius: 12px;

    .header-tool {
      min-height: 44px;
      margin-bottom: 12px;
      border-bottom: 1px dashed var(--color-border-3);
    }

    .file-content {
      flex: 1;
    }
  }
</style>
