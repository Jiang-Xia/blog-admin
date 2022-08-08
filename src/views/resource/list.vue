<script setup lang="ts">
  import { reactive, ref } from 'vue';
  import { baseUrl } from '@/config';
  import { useUserStore } from '@/store';
  import axios from 'axios';
  import { Message } from '@arco-design/web-vue';
  import { number } from '@intlify/core-base';
  import { init } from 'echarts';
  import FileAside from './file-aside.vue';

  const fileList = ref([]);
  const { token } = useUserStore();
  const headers = ref({
    Authorization: `Bearer ${token}`,
  });
  const imageList = ref<any>([]);
  const totalCount = ref(0);
  const current = ref(1);
  const searchForm = ref({
    page: 1,
    pageSize: 20,
    originalname: '',
    type: '',
  });
  const seachHandle = async (page?: number) => {
    if (page) {
      searchForm.value.page = page;
      current.value = page;
    } else {
      searchForm.value.page = 1;
      current.value = 1;
    }
    // console.log(item);
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
  const delHandle = async (id: string) => {
    // axios.delete(`/resources/file/${id}`);
    const res = await axios.delete(`/resources/file`, { params: { id } });
    Message.success('删除成功');
    seachHandle();
  };

  seachHandle();
  const changePage = (v: number) => {
    seachHandle(v);
  };
  const menuSelect = (item: any) => {
    searchForm.value.type = item.type;
    seachHandle();
  };
  const successHandle = () => {
    Message.success('上传成功');
    seachHandle();
  };
</script>

<template>
  <div class="file-manage">
    <FileAside @menu-select="menuSelect"></FileAside>
    <!-- 文件管理 -->
    <div class="file-main">
      <div class="header-tool">
        <!--accept="image/*, video/mp4, audio/mp3, .zip, .rar"-->
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
          v-model="searchForm.originalname"
          :style="{ width: '320px', marginLeft: '40px' }"
          placeholder="输入文件名"
          search-button
          @search="seachHandle()"
          @press-enter="seachHandle()"
        >
          <template #button-icon>
            <icon-search />
          </template>
        </a-input-search>
      </div>
      <section class="file-content">
        <a-trigger
          v-for="item in imageList"
          :key="item.filename"
          trigger="contextMenu"
          position="tr"
          align-point
        >
          <div class="image-item">
            <a-image
              v-if="item.type.includes('image')"
              :src="item.url"
              description=""
              width="60"
              height="60"
              footer-position="outer"
            >
            </a-image>
            <x-icon
              v-else-if="item.type.includes('video')"
              icon="icon-shipin"
            />
            <x-icon
              v-else-if="item.type.includes('audio')"
              icon="icon-yinpin"
            />
            <x-icon
              v-else-if="item.type.includes('text')"
              icon="icon-wenzhang1"
            />
            <x-icon
              v-else-if="item.type.includes('application')"
              icon="icon-baocun"
            />
            <div class="title overflow-hidden-container">{{
              item.originalname
            }}</div>
          </div>
          <template #content>
            <div class="context-menu pointer" @click="delHandle(item.id)">
              <x-icon icon="icon-qingchu"></x-icon>
            </div>
          </template>
        </a-trigger>
        <a-empty v-if="!imageList.length">空空如也</a-empty>
      </section>
      <a-pagination
        :total="totalCount"
        :current="current"
        show-total
        @change="changePage"
      />
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

    .image-item :deep(.x-icon) > svg {
      width: 60px;
      height: 60px;
    }

    .context-menu {
      width: 300px;
      height: 100px;
      background-color: var(--color-fill-1);
    }

    .title {
      padding: 0 10px;
      font-size: 12px;
      text-align: center;
    }
  }
  // .context-menu {
  //   background-color: var(--color-fill-1);
  //   width: 300px;
  //   height: 100px;
  // }
</style>
