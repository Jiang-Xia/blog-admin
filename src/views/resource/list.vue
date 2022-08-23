<script setup lang="ts">
  import { compile, h, reactive, ref } from 'vue';
  import { baseUrl } from '@/config';
  import { useUserStore } from '@/store';
  import axios from 'axios';
  import { Message, Modal, FileItem, Input } from '@arco-design/web-vue';
  import { useClipboard } from '@vueuse/core';
  import FileAside from './file-aside.vue';
  /* 文件上传web是无法实现刷新续传的 */
  const fileList: any = ref([]);
  const { token } = useUserStore();
  const headers = ref({
    Authorization: `Bearer ${token}`,
  });
  const imageList = ref<any>([]);
  const totalCount = ref(0);
  const current = ref(1);
  const searchForm = ref({
    page: 1,
    pageSize: 30,
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
  const { copy } = useClipboard();
  const dropdownSelect = async (v: string, item: any) => {
    console.log(v);
    if (v === '1') {
      await copy(item.url);
      Message.success('复制成功');
    } else if (v === '2') {
    } else if (v === '3') {
      delHandle(item.id);
    }
  };

  const beforeRemove = async (file: FileItem) => {
    const { id = '' } = file.response.data[0];
    const bool: boolean = await axios.delete(`/resources/file`, {
      params: { id },
    });
    if (bool) {
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  };
  const showVisible = ref(false);
  const handleOk = () => {
    showVisible.value = false;
    fileList.value = [];
    seachHandle();
  };

  const folderName = ref('');
  // 新建文件夹
  const addFolder = () => {
    Modal.confirm({
      title: '新建文件夹',
      content: () =>
        h(Input, {
          onChange: (value) => {
            folderName.value = value;
          },
          placeholder: '请输入文件夹名',
        }),
      onOk() {
        axios.post('/resources/folder', { name: folderName.value });
        Message.success('新建完成');
        seachHandle();
      },
    });
  };
</script>

<template>
  <div id="file-manage" class="file-manage">
    <FileAside @menu-select="menuSelect"></FileAside>
    <!-- 文件管理 -->
    <div class="file-main">
      <div class="header-tool">
        <a-space>
          <a-button type="primary" @click="showVisible = !showVisible"
            >上传</a-button
          >
          <a-input-search
            v-model="searchForm.originalname"
            :style="{ width: '320px', marginLeft: '40px' }"
            placeholder="输入文件名搜索"
            search-button
            @search="seachHandle()"
            @press-enter="seachHandle()"
          >
            <template #button-icon>
              <icon-search />
            </template>
          </a-input-search>

          <a-button type="primary" @click="addFolder">新建文件夹</a-button>
        </a-space>
      </div>
      <section class="file-content">
        <a-dropdown
          v-for="item in imageList"
          :key="item.filename"
          trigger="contextMenu"
          align-point
          @select="(v:any)=>{dropdownSelect(v,item)}"
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
            <a-doption value="1">
              <template #icon>
                <x-icon icon="icon-lianjie1" />
              </template>
              复制链接
            </a-doption>
            <!-- <a-doption value="2">
              <template #icon><x-icon icon="icon-bianji1" /></template> 重命名
            </a-doption> -->
            <a-doption value="3">
              <template #icon><x-icon icon="icon-qingchu" /></template> 删除
            </a-doption>
          </template>
        </a-dropdown>
        <a-empty v-if="!imageList.length">空空如也</a-empty>
      </section>
      <a-pagination
        :total="totalCount"
        :current="current"
        :page-size="searchForm.pageSize"
        show-total
        @change="changePage"
      />
    </div>
    <a-modal
      v-model:visible="showVisible"
      hide-cancel
      ok-text="完成"
      modal-class="upload-modal"
      @ok="handleOk"
      @cancel="handleOk"
    >
      <template #title> 上传文件 </template>
      <div class="upload-container">
        <a-upload
          :action="baseUrl + '/resources/uploadFile'"
          name="fileContents"
          multiple
          :limit="10"
          draggable
          :headers="headers"
          :auto-upload="true"
          :show-file-list="true"
          :file-list="fileList"
          image-preview
          @before-remove="beforeRemove"
        />
      </div>
    </a-modal>
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
    padding: 0 12px 12px;
    overflow: auto;
    background: var(--color-bg-1);
    border-radius: 12px;

    .header-tool {
      display: flex;
      align-items: center;
      min-height: 50px;
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
      transition: all 1s ease-in;
    }

    .image-item:hover {
      background-color: var(--color-fill-2);
    }

    .image-item:hover .arco-image {
      transform: scale(1.05);
    }

    .image-item :deep(.x-icon) > svg {
      width: 60px;
      height: 60px;
    }

    .title {
      padding: 0 10px;
      font-size: 12px;
      text-align: center;
    }
  }

  .upload-modal {
    min-height: 70vh;

    .upload-container {
      height: 60vh;
      overflow: auto;
    }
  }
</style>
