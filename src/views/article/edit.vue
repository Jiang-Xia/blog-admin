<template>
  <div class="container">
    <a-card class="general-card">
      <template #title>
        {{ title }}
      </template>

      <!-- body -->
      <section class="create-container">
        <div class="create-content">
          <a-form
            ref="formRef"
            name="custom-validation"
            :model="formState"
            :rules="rules"
            :label-col-props="{ span: 3, offset: 0 }"
            :wrapper-col-props="{ span: 20, offset: 0 }"
            @submit-success="handleFinish"
            @submit-failed="handleFinishFailed"
          >
            <a-form-item :label="t('article.form.title')" name="title" field="title">
              <a-input
                v-model="formState.title"
                autocomplete="off"
                :placeholder="t('article.form.title')"
                allow-clear
              />
            </a-form-item>
            <a-form-item
              :label="t('article.form.description')"
              name="description"
              field="description"
              :placeholder="t('article.form.description')"
            >
              <a-textarea
                v-model="formState.description"
                :placeholder="t('article.form.description')"
                :auto-size="{ minRows: 2, maxRows: 10 }"
              />
            </a-form-item>

            <a-form-item :label="t('article.form.cover')" name="cover" field="cover">
              <a-space direction="vertical" fill>
                <a-input
                  v-model="formState.cover"
                  autocomplete="off"
                  :placeholder="t('article.form.placeholder.coverUrl')"
                  allow-clear
                />
                <a-upload
                  :show-file-list="false"
                  accept="image/jpeg,image/png,image/webp"
                  :custom-request="onCoverUpload"
                >
                  <template #upload-button>
                    <a-button type="outline" size="small" :loading="coverUploading">
                      上传封面
                    </a-button>
                  </template>
                </a-upload>
                <img
                  v-if="formState.cover"
                  :src="coverPreviewUrl"
                  alt="封面预览"
                  class="cover-preview"
                />
              </a-space>
            </a-form-item>

            <a-form-item :label="t('article.form.category')" name="category" field="category">
              <a-select
                v-model="formState.category"
                style="width: 50%"
                :options="categoryOptions"
                :placeholder="t('article.form.placeholder.selectCategory')"
                :field-names="{ value: 'id', label: 'label' }"
              >
              </a-select>
            </a-form-item>

            <a-form-item :label="t('article.form.tag')" name="tags" field="tags">
              <a-select
                v-model="formState.tags"
                style="width: 50%"
                :options="tagsOptions"
                :placeholder="t('article.form.placeholder.selectTag')"
                :field-names="{ value: 'id', label: 'label' }"
                multiple
                class="tag-select"
              >
              </a-select>
            </a-form-item>
            <a-form-item :label="t('article.form.content')" name="content" field="content">
              <md-editor
                v-model="formState.content"
                class="x-md-editor"
                :theme="theme"
                @on-html-changed="onHtmlChanged"
                @on-upload-img="onUploadImg"
              />
            </a-form-item>

            <!-- 发布状态选择 -->
            <a-form-item :label="t('article.form.publishStatus')" field="status">
              <a-radio-group v-model="formState.status" type="button">
                <a-radio value="publish">{{ t('article.status.publish') }}</a-radio>
                <a-radio value="draft">{{ t('article.status.draft') }}</a-radio>
                <a-radio value="scheduled">{{ t('article.status.scheduled') }}</a-radio>
              </a-radio-group>
            </a-form-item>

            <!-- 定时发布时间选择器 -->
            <a-form-item
              v-if="formState.status === 'scheduled'"
              :label="t('article.form.scheduledTime')"
              field="scheduledPublishAt"
              :rules="[{ required: true, message: t('article.validate.scheduledTimeRequired') }]"
            >
              <a-date-picker
                v-model="formState.scheduledPublishAt"
                show-time
                :time-picker-props="{ defaultValue: '12:00:00' }"
                format="YYYY-MM-DD HH:mm:ss"
                :placeholder="t('article.form.placeholder.scheduledTime')"
                style="width: 280px"
              />
            </a-form-item>

            <a-form-item :wrapper-col-props="{ span: 13, offset: 7 }">
              <a-button type="primary" html-type="submit">{{
                formState.status === 'draft'
                  ? t('article.button.saveDraft')
                  : formState.status === 'scheduled'
                    ? t('article.button.schedulePublish')
                    : t('article.button.publish')
              }}</a-button>
              <a-button style="margin-left: 10px" @click="resetForm">{{
                t('article.button.reset')
              }}</a-button>
            </a-form-item>
          </a-form>
        </div>
      </section>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, reactive } from 'vue';
  import { useI18n } from 'vue-i18n';
  import useLoading from '@/hooks/loading';
  import { getArticleInfo, createArticle, editArticle } from '@/api/article';
  import {
    uploadCover,
    uploadArticleImage,
    parseUploadedUrl,
    resolveStaticUrl,
  } from '@/api/resources';
  import { Message, Modal } from '@arco-design/web-vue';
  import { useRoute, useRouter } from 'vue-router';
  import type { ValidatedError } from '@arco-design/web-vue/es/form/interface';
  // import { computed, onBeforeUnmount, onMounted } from 'vue'
  import { MdEditor } from 'md-editor-v3';
  import { useAppStore, useTabBarStore } from '@/store';
  import { useTableNoPageList } from '@/hooks/data';

  const { t } = useI18n();
  const appStore = useAppStore();
  const router = useRouter();
  const route = useRoute();
  const { type } = route.query;
  const title = computed(() => {
    return type === 'edit' ? t('article.title.edit') : t('article.title.create');
  });

  interface FormState {
    title: string;
    description: string;
    content: string;
    contentHtml: string;
    category: string;
    cover: string;
    tags: number[];
    status: string;
    scheduledPublishAt: string;
  }
  const defaultForm = {
    title: '',
    description: '',
    content: '**哈喽！有什么灵感的话赶紧写下来吧~**',
    contentHtml: '',
    category: '',
    cover: '',
    tags: [],
    status: 'publish',
    scheduledPublishAt: '',
  };
  // 分类和标签
  const { list: categoryOptions } = useTableNoPageList('/category', {});
  const { list: tagsOptions } = useTableNoPageList('/tag', {});
  const formRef = ref();
  const coverUploading = ref(false);
  const formState: FormState = reactive({ ...defaultForm });

  const coverPreviewUrl = computed(() => resolveStaticUrl(formState.cover));
  // 自定义异步校验
  const checkTitle = async (value: string, cb: (error?: string) => void) => {
    console.log(value);
    if (!value) {
      cb(t('article.validate.titleRequired'));
    }
    Promise.resolve();
  };
  const checkDescription = async (value: string, cb: (error?: string) => void) => {
    if (!value) {
      cb(t('article.validate.descriptionRequired'));
    }
    Promise.resolve();
  };
  const rules = {
    title: [{ required: true, validator: checkTitle, trigger: 'blur' }],
    description: [{ required: true, validator: checkDescription, trigger: 'blur' }],
    category: [{ required: true, message: '请选择分类！', trigger: 'change' }],
    tags: [{ required: true, message: '请选择标签！', trigger: 'change' }],
    cover: [{ required: true, message: '封面为必填！', trigger: 'blur' }],
    contentHtml: [{ required: true, trigger: 'change' }],
    content: [{ required: true, trigger: 'change' }],
  };
  // 提交成功
  const handleFinish = async (values: Partial<FormState>) => {
    // console.log('values', values)
    const params = {
      ...values,
      content: formState.content,
      contentHtml: formState.contentHtml,
      status: formState.status,
      scheduledPublishAt: formState.status === 'scheduled' ? formState.scheduledPublishAt : null,
      id: 0,
      // cover: formState.cover
    };
    // console.log('params:', params)
    // return
    if (route.query.id) {
      // 编辑
      params.id = Number(route.query.id);
      const res = await editArticle(params);
      Message.success(t('article.message.updateSuccess'));
    } else {
      // 新建
      const res = await createArticle(params);
      Message.success(t('article.message.createSuccess'));
    }
    router.push({ name: 'ArticleList' });
    const tabBarStore = useTabBarStore();
    tabBarStore.deleteCurrentTag(route);
  };
  // 提交失败
  const handleFinishFailed = (errors: Record<string, ValidatedError>) => {
    console.log(errors);
  };
  const resetForm = () => {
    formRef.value.resetFields();
  };

  // const ArticleInfo = ref({})
  // 文章编辑
  const getArticleInfoHandle = async () => {
    const { query } = route;
    const res = await getArticleInfo(query);
    const info: {
      title: string;
      description: string;
      content: string;
      category: { id: string };
      cover: string;
      tags: Array<{ id: number }>;
      status: string;
      scheduledPublishAt: string;
    } = res.info as any;
    formState.title = info.title;
    formState.description = info.description;
    formState.content = info.content;
    formState.category = info.category.id;
    formState.cover = info.cover;
    formState.tags = info.tags.map((v) => v.id);
    formState.status = info.status || 'publish';
    formState.scheduledPublishAt = info.scheduledPublishAt || '';
    // console.log(formState);
  };
  if (type === 'edit') {
    getArticleInfoHandle();
  }

  // 主题
  const theme = computed(() => {
    if (appStore.theme === 'dark') return 'dark';
    return 'light';
  });
  const onHtmlChanged = (html: string) => {
    formState.contentHtml = html;
  };
  const { loading } = useLoading();
  // 上传图片功能
  const onUploadImg = async (files: File[], callback: (urls: string[]) => void) => {
    loading.value = true;
    try {
      const urls = await Promise.all(
        files.map(async (file: File) => {
          const res = await uploadArticleImage(file);
          return parseUploadedUrl(res);
        }),
      );
      callback(urls);
    } finally {
      loading.value = false;
    }
  };

  const onCoverUpload = async (option: {
    fileItem: { file?: File };
    onSuccess: (res?: unknown) => void;
    onError: (err: unknown) => void;
  }) => {
    const file = option.fileItem.file;
    if (!file) {
      option.onError(new Error('无效文件'));
      return;
    }
    coverUploading.value = true;
    try {
      const res = await uploadCover(file);
      formState.cover = parseUploadedUrl(res);
      option.onSuccess(res);
      Message.success('封面上传成功');
    } catch (err) {
      option.onError(err);
      Message.error('封面上传失败');
    } finally {
      coverUploading.value = false;
    }
  };
</script>

<script lang="ts">
  export default {
    name: 'ArticleEdit',
  };
</script>

<style scoped lang="less">
  .container {
    padding: 20px;

    .create-container {
      z-index: 0;
      width: 80%;
      min-width: 40vh;
      max-width: 1600px;
      margin: 0 auto;
      background-color: var(--color-menu-light-bg);
      border-radius: var(--border-radius-small);
      @media screen and (max-width: 768px) {
        width: 95%;
      }
    }
  }

  .x-md-editor {
    min-width: 500px;
    // background-color: var(--color-bg-2);
    // border-color: var(--color-bg-2);
    border-radius: 4px;

    .md-toolbar-wrapper {
      .md-toolbar {
        flex-wrap: nowrap;
      }
    }
  }

  .cover-preview {
    display: block;
    max-width: 280px;
    max-height: 158px;
    margin-top: 8px;
    object-fit: cover;
    border-radius: 4px;
    border: 1px solid var(--color-border-2);
  }
</style>
