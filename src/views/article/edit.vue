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
            <a-form-item label="标题" name="title" field="title">
              <a-input
                v-model="formState.title"
                autocomplete="off"
                placeholder="标题"
              />
            </a-form-item>
            <a-form-item
              label="描述"
              name="description"
              field="description"
              placeholder="描述"
            >
              <a-textarea
                v-model="formState.description"
                placeholder="描述"
                :auto-size="{ minRows: 2, maxRows: 10 }"
              />
            </a-form-item>

            <a-form-item label="封面" name="cover" field="cover">
              <a-input
                v-model="formState.cover"
                autocomplete="off"
                placeholder="封面支持外链url或者base64(1M以内)"
              />
            </a-form-item>

            <a-form-item label="分类" name="category" field="category">
              <a-select
                v-model="formState.category"
                style="width: 50%"
                :options="categoryOptions"
                placeholder="选择一种分类"
              >
              </a-select>
            </a-form-item>

            <a-form-item
              label="标签"
              name="tags"
              field="tags"
              placeholder="选择标签 "
            >
              <a-select
                v-model="formState.tags"
                style="width: 50%"
                :options="tagsOptions"
                multiple
                class="tag-select"
              >
              </a-select>
            </a-form-item>
            <a-form-item label="内容" name="contentHtml" field="contentHtml">
              <md-editor
                v-model="formState.contentHtml"
                class="x-md-editor"
                :theme="theme"
              />
            </a-form-item>

            <a-form-item :wrapper-col-props="{ span: 13, offset: 7 }">
              <a-button type="primary" html-type="submit">提交</a-button>
              <a-button style="margin-left: 10px" @click="resetForm"
                >重置</a-button
              >
            </a-form-item>
          </a-form>
        </div>
      </section>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, reactive } from 'vue';
  import useLoading from '@/hooks/loading';
  import { Pagination } from '@/types/global';
  import { getArticleInfo, createArticle, editArticle } from '@/api/article';
  import { Message, Modal } from '@arco-design/web-vue';
  import { useRoute, useRouter } from 'vue-router';
  import { ValidatedError } from '@arco-design/web-vue/es/form/interface';
  // import { computed, onBeforeUnmount, onMounted } from 'vue'
  import MdEditor from 'md-editor-v3';
  import { useAppStore } from '@/store';
  import { categoryOptions, tagsOptions } from './common';
  import 'md-editor-v3/lib/style.css';

  const appStore = useAppStore();
  const router = useRouter();
  const route = useRoute();
  const { type } = route.query;
  const title = computed(() => {
    return type === 'edit' ? '编辑文章' : '新增文章';
  });

  interface FormState {
    title: string;
    description: string;
    // content: string;
    contentHtml: string;
    category: string;
    cover: string;
    tags: number[];
  }
  const defaultForm = {
    title: '',
    description: '',
    // content: '',
    contentHtml: '**哈喽！有什么灵感的话赶紧写下来吧~**',
    category: '',
    cover: '',
    tags: [],
  };

  const formRef = ref();
  const formState: FormState = reactive({ ...defaultForm });
  // 自定义异步校验
  const checkTitle = async (value: string, cb: (error?: string) => void) => {
    console.log(value);
    if (!value) {
      cb('请输入标题！');
    }
    Promise.resolve();
  };
  const checkDescription = async (
    value: string,
    cb: (error?: string) => void
  ) => {
    if (!value) {
      cb('请输入描述！');
    }
    Promise.resolve();
  };
  const rules = {
    title: [{ required: true, validator: checkTitle, trigger: 'blur' }],
    description: [
      { required: true, validator: checkDescription, trigger: 'blur' },
    ],
    category: [{ required: true, message: '请选择分类！', trigger: 'change' }],
    tags: [{ required: true, message: '请选择标签！', trigger: 'change' }],
    cover: [{ required: true, message: '封面为必填！', trigger: 'blur' }],
    contentHtml: [{ required: true, trigger: 'change' }],
  };
  // 提交成功
  const handleFinish = async (values: any) => {
    // console.log('values', values)
    const params = {
      ...values,
      // content: formState.content,
      contentHtml: formState.contentHtml,
      id: 0,
      // cover: formState.cover
    };
    // console.log('params:', params)
    // return
    if (route.query.id) {
      // 编辑
      params.id = Number(route.query.id);
      const res = await editArticle(params);
      Message.success('修改成功！');
    } else {
      // 新建
      const res = await createArticle(params);
      Message.success('新建成功！');
    }
    router.push('/article/list');
  };
  // 提交失败
  const handleFinishFailed = (errors: any) => {
    console.log(errors);
  };
  const resetForm = () => {
    formRef.value.resetFields();
  };

  // const ArticleInfo = ref({})
  // 文章编辑
  const getArticleInfoHandle = async () => {
    const { query } = route;
    let res = await getArticleInfo(query);
    res = res.info;
    formState.title = res.title;
    formState.description = res.description;
    // formState.content = res.content;
    formState.contentHtml = res.contentHtml;
    formState.category = res.category.id;
    formState.cover = res.cover;
    formState.tags = res.tags.map((v: any) => v.id);
  };
  if (type === 'edit') {
    getArticleInfoHandle();
  }

  // 主题
  const theme = computed(() => {
    if (appStore.theme === 'dark') return 'dark';
    return 'light';
  });
</script>

<script lang="ts">
  export default {
    name: 'SearchTable',
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
      margin: 0 auto 0;
      background-color: var(--color-menu-light-bg);
      border-radius: var(--border-radius-small);
      @media screen and (max-width: 768px) {
        width: 95%;
      }
    }
  }

  .x-md-editor {
    // background-color: var(--color-bg-2);
    // border-color: var(--color-bg-2);
    border-radius: 4px;
  }
</style>
