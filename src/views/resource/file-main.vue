<script setup lang="ts">
  import { reactive, ref } from 'vue';
  import { baseUrl } from '@/config';
  import { useUserStore } from '@/store';
  import axios from 'axios';
  import { Message } from '@arco-design/web-vue';

  const fileList = ref([]);
  const { token } = useUserStore();
  const headers = ref({
    Authorization: `Bearer ${token}`,
  });
  const successHandle = () => {
    Message.success('上传成功');
  };
  const imageList = ref<any>([]);
  const totalCount = ref(0);
  axios.get('/resources/file').then((res: any) => {
    const [list, total] = res.data;
    imageList.value = list.map((v: any) => {
      v.visible = false;
      v.url = baseUrl + v.url;
      return v;
    });
    totalCount.value = total;
  });
  const delHandle = (id: string) => {
    axios.get('/resources/delete', { params: { id } });
  };
</script>

<template>
  <div class="file-main">
    <div class="header-tool">
      <!-- list-type="picture-card" -->
      <a-upload
        :action="baseUrl + '/resources/uploadFile'"
        multiple
        :limit="10"
        :headers="headers"
        :show-file-list="false"
        :default-file-list="fileList"
        image-preview
        @success="successHandle"
      />
    </div>
    <section class="file-content">
      <div v-for="item in imageList" :key="item.filename" class="image-item">
        <a-image
          :src="item.url"
          description=""
          width="60"
          height="60"
          footer-position="outer"
        >
        </a-image>
        <div class="title overflow-hidden-container">{{
          item.originalname
        }}</div>
      </div>
      <a-empty v-if="!imageList.length">空空如也</a-empty>
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
      display: flex;
      align-items: center;
      min-height: 44px;
      margin-bottom: 12px;
      border-bottom: 1px dashed var(--color-border-3);
    }

    .file-content {
      display: flex;
      flex: 1;
      flex-wrap: wrap;
      align-content: flex-start;
    }

    :deep(.arco-image-footer-caption-title) {
      font-size: 12px;
    }

    .image-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      width: 100px;
      height: 100px;
      cursor: pointer;
    }

    .image-item:hover {
      background-color: var(--color-fill-2);
    }

    .image-item:hover .arco-image {
      transform: scale(1.03, 1.02);
    }

    .title {
      padding: 0 10px;
      font-size: 12px;
      text-align: center;
    }
  }
</style>
