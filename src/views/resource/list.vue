<script setup lang="ts">
  import { h, ref } from 'vue';
  import { baseUrl } from '@/config';
  import { useUserStore } from '@/store';
  import request from '@/api/request';

  import {
    Message,
    Modal,
    FileItem,
    Input,
    Select,
  } from '@arco-design/web-vue';
  import { useClipboard } from '@vueuse/core';
  import { xAdminStore } from '@/utils';
  import useLoading from '@/hooks/loading';
  import FileAside from './file-aside.vue';

  const { loading, setLoading } = useLoading();

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
    setLoading(true);
    if (page) {
      searchForm.value.page = page;
      current.value = page;
    } else {
      searchForm.value.page = 1;
      current.value = 1;
    }
    // console.log(item);
    const res = await request.get('/resources/files', {
      params: {
        ...searchForm.value,
        pid: xAdminStore.value.folderId || '0',
      },
    });
    const [list, total] = res.data;
    imageList.value = list.map((v: any) => {
      v.visible = false;
      v.url = baseUrl + v.url;
      return v;
    });
    totalCount.value = total;
    setTimeout(() => {
      setLoading(false);
    }, 300);
  };
  const delHandle = async (id: string) => {
    // request.delete(`/resources/file/${id}`);
    const res = await request.delete(`/resources/file`, { params: { id } });
    Message.success('删除成功');
    seachHandle();
  };
  // 移动文件
  const targetPid = ref('');
  const moveHandle = async (id: string) => {
    const res = await request.get('/resources/files', {
      params: { pageSize: 100 },
    });

    const [list, total] = res.data;

    Modal.confirm({
      title: '新建文件夹',
      content: () =>
        h(Select, {
          onChange: (value) => {
            targetPid.value = value as string;
          },
          placeholder: '请选择文件夹',
          options: list
            .filter((v: any) => v.isFolder)
            .map((v: any) => {
              return {
                value: v.id,
                label: v.filename,
              };
            }),
        }),
      async onOk() {
        await request.patch(`/resources/file`, {
          id,
          pid: targetPid.value,
        });
        Message.success('移动完成');
        seachHandle();
      },
    });
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
    } else if (v === '4') {
      moveHandle(item.id);
    }
  };

  const beforeRemove = async (file: FileItem) => {
    const { id = '' } = file.response.data[0];
    const bool: boolean = await request.delete(`/resources/file`, {
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
      async onOk() {
        await request.post('/resources/folder', { name: folderName.value });
        Message.success('新建完成');
        seachHandle();
      },
    });
  };

  const currentFolder = ref('');

  // 点击文件夹
  const clickFolder = (item: any) => {
    if (!item.isFolder) {
      return;
    }
    currentFolder.value = item.filename;
    xAdminStore.value.folderId = item.id;
    seachHandle();
  };
  const clearFolderId = () => {
    currentFolder.value = '';
    xAdminStore.value.folderId = '';
    seachHandle();
  };
  clearFolderId();
</script>

<template>
  <div id="file-manage" class="file-manage">
    <FileAside @menu-select="menuSelect"></FileAside>
    <!-- 文件管理 -->
    <div class="file-main">
      <div class="header-tool">
        <a-space>
          <a-breadcrumb>
            <a-breadcrumb-item>
              <a-button type="text" @click="clearFolderId">{{
                !xAdminStore.folderId ? '全部文件' : '返回根目录'
              }}</a-button>
            </a-breadcrumb-item>
            <a-breadcrumb-item>{{ currentFolder }}</a-breadcrumb-item>
          </a-breadcrumb>
        </a-space>
        <a-space>
          <a-button type="primary" @click="showVisible = !showVisible"
            >上传</a-button
          >
          <a-input-search
            v-model="searchForm.originalname"
            :style="{ width: '320px', marginLeft: '40px' }"
            placeholder="输入文件名搜索"
            search-button
            allow-clear
            @search="seachHandle()"
            @press-enter="seachHandle()"
            @clear="seachHandle()"
          >
            <template #button-icon>
              <icon-search />
            </template>
          </a-input-search>

          <a-button type="primary" @click="addFolder">新建文件夹</a-button>
        </a-space>
      </div>
      <section class="file-content">
        <a-spin v-show="loading"> </a-spin>
        <a-dropdown
          v-for="item in imageList"
          :key="item.filename"
          trigger="contextMenu"
          align-point
          @select="(v:any)=>{dropdownSelect(v,item)}"
          @click="clickFolder(item)"
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
            <x-icon v-else-if="item.isFolder" icon="icon-wenjianjia" />
            <div class="title overflow-hidden-container">{{
              item.originalname
            }}</div>
          </div>
          <template #content>
            <a-doption v-if="!item.isFolder" value="1">
              <template #icon>
                <x-icon icon="icon-lianjie1" />
              </template>
              复制链接
            </a-doption>
            <!-- <a-doption value="2">
              <template #icon><x-icon icon="icon-bianji1" /></template> 重命名
            </a-doption> -->
            <a-doption v-if="!item.isFolder" value="4">
              <template #icon>
                <x-icon icon="icon-yidongwenjian" />
              </template>
              移动到
            </a-doption>
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
          :data="{ pid: xAdminStore.folderId }"
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
      justify-content: space-between;
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
