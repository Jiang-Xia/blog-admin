<script setup lang="ts">
  import { reactive, ref } from 'vue';
  import { baseUrl } from '@/config';
  import { useUserStore } from '@/store';
  import axios from 'axios';
  import { Message } from '@arco-design/web-vue';
  import FileAside from './file-aside.vue';

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
  const delHandle = (id: string) => {
    axios.get('/resources/delete', { params: { id } });
  };
  const searchForm = ref({
    page: 1,
    pageSize: 40,
    filename: '',
    type: '',
  });
  const seachHandle = async () => {
    const res = await axios.get('/resources/files', {
      params: searchForm.value,
    });
    const [list, total] = res.data;
    imageList.value = list.map((v: any) => {
      v.visible = false;
      v.url = baseUrl + v.url;
      return v;
    });
    totalCount.value = total;
  };
  seachHandle();
</script>

<template>
  <div class="file-manage">
    <FileAside @menu-select="seachHandle"></FileAside>
    <!-- 文件管理 -->
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
        <a-input-search
          :style="{ width: '320px', marginLeft: '40px' }"
          placeholder="输入文件名"
          search-button
        >
          <template #button-icon>
            <icon-search />
          </template>
        </a-input-search>
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
      <a-pagination :total="totalCount" show-total />
    </div>
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

  .file-main {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 50vh;
    // max-height: 80vh;
    padding: 0 12px 12px 12px;
    overflow: auto;
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
